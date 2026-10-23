import { createContext, useCallback, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'

// the open title lives in the address (?watch=movie-603), so it can be shared and survives a refresh
const TitleModalContext = createContext({ open: () => {}, close: () => {}, current: null })

export function TitleModalProvider({ children }) {
  const [params, setParams] = useSearchParams()
  const watch = params.get('watch') || ''
  const [type, id] = watch.split('-')
  const valid = (type === 'movie' || type === 'tv') && /^\d+$/.test(id || '')
  const current = valid ? { type, id: Number(id), play: params.get('play') === '1' } : null

  const open = useCallback((item, { play = false } = {}) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('watch', `${item.type}-${item.id}`)
      if (play) next.set('play', '1'); else next.delete('play')
      return next
    })
  }, [setParams])

  const close = useCallback(() => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete('watch'); next.delete('play')
      return next
    }, { replace: true })
  }, [setParams])

  return <TitleModalContext.Provider value={{ open, close, current }}>{children}</TitleModalContext.Provider>
}

export const useTitleModal = () => useContext(TitleModalContext)
