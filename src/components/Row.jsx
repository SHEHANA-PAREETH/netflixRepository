import { useCallback, useEffect, useRef, useState } from 'react'
import { describeError } from '../api/tmdb'
import { useFetch } from '../hooks/useFetch'
import { useInView } from '../hooks/useInView'
import Card from './Card'
import Icon from './Icon'

const PLACEHOLDERS = [0, 1, 2, 3, 4, 5, 6, 7]

// one horizontal shelf. Give it `items`, or `load` (a function returning a promise of items) and it fetches when scrolled near
export default function Row({ title, items, load, variant = 'poster', limit }) {
  const [wrapper, near] = useInView()
  const scroller = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const remote = useFetch(() => (load && near ? load() : Promise.resolve(null)), [near, load])
  // placeholders show until the data has really arrived (data stays null until then)
  const loading = !items && Boolean(load) && remote.data === null && !remote.error
  const list = (items || remote.data || []).slice(0, limit || 20)

  const measure = useCallback(() => {
    const node = scroller.current
    if (!node) return
    setEdges({ start: node.scrollLeft < 8, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 8 })
  }, [])

  useEffect(() => {
    measure()
    const node = scroller.current
    if (!node || !('ResizeObserver' in window)) return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [measure, list.length])

  const scrollBy = (direction) => {
    const node = scroller.current
    node?.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: 'smooth' })
  }

  if (!loading && !remote.error && list.length === 0) return null

  return (
    <section className={`row row-${variant}`} ref={wrapper} aria-label={title}>
      <h2 className="row-title">{title}</h2>
      {remote.error ? (
        <div className="row-error">
          <span>{describeError(remote.error)}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={remote.retry}>Try again</button>
        </div>
      ) : (
        <div className="row-body">
          <button type="button" className="row-arrow left" onClick={() => scrollBy(-1)} disabled={edges.start} aria-label={`Scroll ${title} left`}><Icon name="left" size={26} /></button>
          <div className="row-scroller" ref={scroller} onScroll={measure}>
            {loading
              ? PLACEHOLDERS.map((n) => <div key={n} className={`card card-${variant} skeleton`} aria-hidden="true" />)
              : list.map((item, index) => <Card key={item.key} item={item} variant={variant} rank={index + 1} />)}
          </div>
          <button type="button" className="row-arrow right" onClick={() => scrollBy(1)} disabled={edges.end} aria-label={`Scroll ${title} right`}><Icon name="right" size={26} /></button>
        </div>
      )}
    </section>
  )
}
