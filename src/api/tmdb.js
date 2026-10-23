// Everything that talks to TMDB (The Movie Database) lives here.
const BASE = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_KEY
const IMAGES = 'https://image.tmdb.org/t/p'

export const hasKey = Boolean(KEY)

// a TMDB picture address at the size a place needs (w185, w342, w500, w780, w1280 ...)
export const img = (path, size = 'w500') => (path ? `${IMAGES}/${size}${path}` : '')

// identical requests share one answer, and a failed one is forgotten so a retry really retries
const cache = new Map()
export function tmdb(path, params = {}) {
  if (!KEY) return Promise.reject(new Error('missing-key'))
  const query = new URLSearchParams({ api_key: KEY, language: 'en-US', ...params })
  const url = `${BASE}/${path}?${query}`
  if (!cache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(response.status === 401 ? 'bad-key' : `http-${response.status}`)
        return response.json()
      })
      .catch((error) => {
        cache.delete(url)
        throw error
      })
    cache.set(url, request)
  }
  return cache.get(url)
}

// one shape for movies and TV shows, whichever endpoint they came from
export function normalize(item, fallbackType) {
  const type = item.media_type || fallbackType || (item.first_air_date ? 'tv' : 'movie')
  return {
    key: `${type}-${item.id}`,
    id: item.id,
    type,
    title: item.title || item.name || 'Untitled',
    date: item.release_date || item.first_air_date || '',
    rating: item.vote_average || 0,
    overview: item.overview || '',
    poster: item.poster_path || '',
    backdrop: item.backdrop_path || '',
    genres: item.genre_ids || [],
  }
}

const listOf = (data, type) =>
  (data.results || []).filter((item) => item.media_type !== 'person').map((item) => normalize(item, type))

export const year = (item) => (item.date ? item.date.slice(0, 4) : '')

// ---------- lists ----------
export const getList = async (path, type, params) => listOf(await tmdb(path, params), type)

export async function getPage(path, type, page, params = {}) {
  const data = await tmdb(path, { page, ...params })
  return { items: listOf(data, type), hasMore: page < Math.min(data.total_pages || 1, 500) }
}

export const search = (query, page) => getPage('search/multi', undefined, page, { query, include_adult: 'false' })

// ---------- genres (movies and TV together, for names on the hero) ----------
let genreNames
export function getGenreNames() {
  genreNames ||= Promise.all([tmdb('genre/movie/list'), tmdb('genre/tv/list')])
    .then(([movie, tv]) => Object.fromEntries([...movie.genres, ...tv.genres].map((genre) => [genre.id, genre.name])))
    .catch((error) => { genreNames = undefined; throw error })
  return genreNames
}
export const getGenres = async (type) => (await tmdb(`genre/${type}/list`)).genres

// ---------- one title ----------
export async function getDetails(type, id) {
  const data = await tmdb(`${type}/${id}`, { append_to_response: 'videos,credits,similar,release_dates,content_ratings' })
  const item = normalize(data, type)

  // best trailer first: an official trailer, then any trailer, then a teaser
  const videos = (data.videos?.results || []).filter((video) => video.site === 'YouTube')
  const trailer =
    videos.find((video) => video.type === 'Trailer' && video.official) ||
    videos.find((video) => video.type === 'Trailer') ||
    videos.find((video) => video.type === 'Teaser') ||
    videos[0]

  const certification =
    type === 'movie'
      ? data.release_dates?.results?.find((entry) => entry.iso_3166_1 === 'US')?.release_dates?.find((entry) => entry.certification)?.certification
      : data.content_ratings?.results?.find((entry) => entry.iso_3166_1 === 'US')?.rating

  return {
    ...item,
    tagline: data.tagline || '',
    genreNames: (data.genres || []).map((genre) => genre.name),
    runtime: type === 'movie' ? data.runtime : data.episode_run_time?.[0] || 0,
    seasons: data.number_of_seasons || 0,
    status: data.status || '',
    certification: certification || '',
    trailerKey: trailer?.key || '',
    cast: (data.credits?.cast || []).slice(0, 10).map((person) => ({ id: person.id, name: person.name, role: person.character, photo: person.profile_path })),
    director: type === 'movie' ? data.credits?.crew?.find((person) => person.job === 'Director')?.name || '' : (data.created_by || []).map((person) => person.name).join(', '),
    similar: (data.similar?.results || []).filter((entry) => entry.poster_path).slice(0, 12).map((entry) => normalize(entry, type)),
  }
}

// ---------- friendly wording for errors ----------
export const describeError = (error) => {
  if (error?.message === 'missing-key') return 'The TMDB API key is missing. Add it to the .env file.'
  if (error?.message === 'bad-key') return 'TMDB rejected the API key. Check the key in the .env file.'
  return "Couldn't load this right now."
}
