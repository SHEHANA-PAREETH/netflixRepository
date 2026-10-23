import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// "My List" and "Recently viewed" live in the browser (localStorage), no account needed
const LIST_KEY = 'nf:list'
const RECENT_KEY = 'nf:recent'
const MAX_RECENT = 20

const read = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : []
  } catch (error) {
    return []
  }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (error) { /* private mode: keep it in memory only */ }
}

// only what the cards need is stored
const slim = (item) => ({
  key: item.key, id: item.id, type: item.type, title: item.title, date: item.date,
  rating: item.rating, overview: item.overview, poster: item.poster, backdrop: item.backdrop, genres: item.genres || [],
})

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [list, setList] = useState(() => read(LIST_KEY))
  const [recent, setRecent] = useState(() => read(RECENT_KEY))

  useEffect(() => write(LIST_KEY, list), [list])
  useEffect(() => write(RECENT_KEY, recent), [recent])

  // another tab changed the list: follow it
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === LIST_KEY) setList(read(LIST_KEY))
      if (event.key === RECENT_KEY) setRecent(read(RECENT_KEY))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const has = useCallback((item) => list.some((entry) => entry.key === item.key), [list])
  const toggle = useCallback((item) => {
    let added = false
    setList((current) => {
      if (current.some((entry) => entry.key === item.key)) return current.filter((entry) => entry.key !== item.key)
      added = true
      return [slim(item), ...current]
    })
    return added
  }, [])
  const addRecent = useCallback((item) => {
    setRecent((current) => [slim(item), ...current.filter((entry) => entry.key !== item.key)].slice(0, MAX_RECENT))
  }, [])
  const clearAll = useCallback(() => { setList([]); setRecent([]) }, [])

  const value = useMemo(() => ({ list, recent, has, toggle, addRecent, clearAll }), [list, recent, has, toggle, addRecent, clearAll])
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export const useLibrary = () => useContext(LibraryContext)
