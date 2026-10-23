import { useCallback, useEffect, useState } from 'react'
import { getGenres, getPage } from '../api/tmdb'
import Grid from '../components/Grid'
import Hero from '../components/Hero'
import { useFetch } from '../hooks/useFetch'
import { useInfinite } from '../hooks/useInfinite'

const SORTS = [['popularity.desc', 'Popular'], ['vote_average.desc', 'Top rated'], ['primary_release_date.desc', 'Newest']]

// Movies and TV Shows share this page: genre chips, a sort and endless scrolling
export default function Browse({ type }) {
  const [genre, setGenre] = useState('')
  const [sort, setSort] = useState('popularity.desc')
  const label = type === 'tv' ? 'TV Shows' : 'Movies'
  const genres = useFetch(() => getGenres(type), [type])

  useEffect(() => { setGenre(''); setSort('popularity.desc'); document.title = `${label} – Netflix Clone` }, [type, label])

  const fetchPage = useCallback((page) => {
    const sortBy = type === 'tv' && sort === 'primary_release_date.desc' ? 'first_air_date.desc' : sort
    const params = { sort_by: sortBy, 'vote_count.gte': sortBy.startsWith('vote_average') ? '300' : '0' }
    if (genre) params.with_genres = genre
    return getPage(`discover/${type}`, type, page, params)
  }, [type, genre, sort])
  const feed = useInfinite(fetchPage, [fetchPage])

  return (
    <>
      <Hero path={`trending/${type}/week`} type={type} label={`Trending ${label}`} />
      <div className="page">
        <div className="toolbar">
          <h1>{label}</h1>
          <label className="select">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORTS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
        </div>
        <div className="chips" role="group" aria-label="Filter by genre">
          <button type="button" className={`chip ${genre === '' ? 'on' : ''}`} aria-pressed={genre === ''} onClick={() => setGenre('')}>All</button>
          {(genres.data || []).map((entry) => (
            <button key={entry.id} type="button" className={`chip ${genre === String(entry.id) ? 'on' : ''}`} aria-pressed={genre === String(entry.id)} onClick={() => setGenre(String(entry.id))}>{entry.name}</button>
          ))}
        </div>
        <Grid {...feed} onMore={feed.loadMore} empty={<div className="notice"><p>Nothing found for this filter.</p></div>} />
      </div>
    </>
  )
}
