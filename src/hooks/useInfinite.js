import { useCallback, useEffect, useRef, useState } from 'react'

// pages of results that keep loading as the sentinel element scrolls into view
export function useInfinite(fetchPage, deps) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const busy = useRef(false)
  const generation = useRef(0)

  // a new search or filter starts again from page one
  useEffect(() => {
    generation.current += 1
    busy.current = false
    setItems([]); setPage(0); setHasMore(true); setError(null); setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const loadMore = useCallback(async () => {
    if (busy.current || !hasMore) return
    busy.current = true
    setLoading(true)
    setError(null)
    const mine = generation.current
    try {
      const next = page + 1
      const result = await fetchPage(next)
      if (mine !== generation.current) return
      setItems((current) => {
        const seen = new Set(current.map((item) => item.key))
        return [...current, ...result.items.filter((item) => !seen.has(item.key))]
      })
      setPage(next)
      setHasMore(result.hasMore)
    } catch (problem) {
      if (mine === generation.current) setError(problem)
    } finally {
      if (mine === generation.current) { busy.current = false; setLoading(false) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, fetchPage])

  return { items, loading, error, hasMore, loadMore }
}
