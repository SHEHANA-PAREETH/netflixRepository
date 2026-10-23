import { useEffect } from 'react'
import { getList } from '../api/tmdb'
import Hero from '../components/Hero'
import Row from '../components/Row'
import { useLibrary } from '../context/Library'

// loaders are defined once so each row fetches a single time
const top10 = () => getList('trending/movie/week', 'movie')
const trending = () => getList('trending/all/week')
const originals = () => getList('discover/tv', 'tv', { with_networks: '213', sort_by: 'popularity.desc' })
const popularMovies = () => getList('movie/popular', 'movie')
const topRated = () => getList('movie/top_rated', 'movie')
const popularTv = () => getList('tv/popular', 'tv')
const nowPlaying = () => getList('movie/now_playing', 'movie')
const upcoming = () => getList('movie/upcoming', 'movie')

const genreRow = (id) => () => getList('discover/movie', 'movie', { with_genres: String(id), sort_by: 'popularity.desc' })
const GENRES = [[28, 'Action & Adventure'], [35, 'Comedies'], [27, 'Horror'], [878, 'Sci-Fi'], [10749, 'Romance'], [99, 'Documentaries']]
  .map(([id, title]) => ({ title, load: genreRow(id) }))

export default function Home() {
  const { list, recent } = useLibrary()
  useEffect(() => { document.title = 'Home – Netflix Clone' }, [])

  return (
    <>
      <Hero />
      <div className="rows">
        {recent.length > 0 && <Row title="Continue exploring" items={recent} variant="backdrop" />}
        {list.length > 0 && <Row title="My List" items={list} />}
        <Row title="Top 10 movies this week" load={top10} variant="top10" limit={10} />
        <Row title="Trending now" load={trending} />
        <Row title="Only on Netflix" load={originals} />
        <Row title="Popular movies" load={popularMovies} variant="backdrop" />
        <Row title="Popular TV shows" load={popularTv} />
        <Row title="Critically acclaimed" load={topRated} />
        <Row title="Now in cinemas" load={nowPlaying} variant="backdrop" />
        {GENRES.map((row) => <Row key={row.title} title={row.title} load={row.load} />)}
        <Row title="Coming soon" load={upcoming} />
      </div>
    </>
  )
}
