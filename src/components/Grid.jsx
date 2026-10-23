import { useEffect, useRef } from 'react'
import { describeError } from '../api/tmdb'
import Card from './Card'

// a wall of cards that loads the next page when you reach the bottom
export default function Grid({ items, loading, error, hasMore, onMore, empty }) {
  const sentinel = useRef(null)

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore) return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) onMore() }, { rootMargin: '600px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, onMore, items.length])

  return (
    <>
      {items.length > 0 && (
        <div className="grid">
          {items.map((item) => <Card key={item.key} item={item} />)}
        </div>
      )}
      {loading && (
        <div className="grid" aria-hidden="true">
          {Array.from({ length: items.length ? 6 : 12 }, (_, n) => <div key={n} className="card card-poster skeleton" />)}
        </div>
      )}
      {error && (
        <div className="notice">
          <p>{describeError(error)}</p>
          <button type="button" className="btn btn-ghost" onClick={onMore}>Try again</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && !hasMore && empty}
      <div ref={sentinel} className="sentinel" />
    </>
  )
}
