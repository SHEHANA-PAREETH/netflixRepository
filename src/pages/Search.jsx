import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { search } from '../api/tmdb'
import Grid from '../components/Grid'
import { useInfinite } from '../hooks/useInfinite'

export default function Search() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim()

  const fetchPage = useCallback(async (page) => {
    const result = await search(query, page)
    // people have no poster; keep only titles
    return { ...result, items: result.items.filter((item) => item.type === 'movie' || item.type === 'tv') }
  }, [query])
  const feed = useInfinite(fetchPage, [fetchPage])

  useEffect(() => { document.title = query ? `${query} – Search` : 'Search – Netflix Clone' }, [query])
  // the first page loads by itself when the query changes
  useEffect(() => { if (query) feed.loadMore() }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <div className="toolbar">
        <h1>{query ? <>Results for “{query}”</> : 'Search'}</h1>
      </div>
      {!query ? (
        <div className="notice"><p>Type a movie, show or person in the search box above.</p></div>
      ) : (
        <Grid {...feed} onMore={feed.loadMore} empty={<div className="notice"><h2>No results</h2><p>Nothing matched “{query}”. Try another spelling or a shorter word.</p></div>} />
      )}
    </div>
  )
}
