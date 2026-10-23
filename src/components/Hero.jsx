import { useEffect, useMemo, useState } from 'react'
import { describeError, getGenreNames, getList, img, year } from '../api/tmdb'
import { useLibrary } from '../context/Library'
import { useTitleModal } from '../context/TitleModal'
import { useToast } from '../context/Toast'
import { useFetch } from '../hooks/useFetch'
import Icon from './Icon'

const SLIDE_MS = 8000

// the big banner at the top: a few trending titles that rotate on their own
export default function Hero({ path = 'trending/all/day', type, label = 'Trending today' }) {
  const { open } = useTitleModal()
  const { has, toggle } = useLibrary()
  const notify = useToast()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = useFetch(() => getList(path, type), [path, type])
  const names = useFetch(() => getGenreNames(), [])
  const items = useMemo(() => (slides.data || []).filter((item) => item.backdrop && item.poster).slice(0, 6), [slides.data])
  const item = items[index % Math.max(items.length, 1)]

  // move on every few seconds, but never while someone is reading, and not for people who asked for less motion
  useEffect(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paused || calm || items.length < 2) return undefined
    const timer = setTimeout(() => setIndex((current) => (current + 1) % items.length), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [paused, items.length, index])

  // fetch the next picture early so the change is instant
  useEffect(() => {
    if (items.length < 2) return
    const next = items[(index + 1) % items.length]
    new Image().src = img(next.backdrop, 'w1280')
  }, [items, index])

  if (slides.error) {
    return (
      <section className="hero hero-empty">
        <div className="hero-content">
          <h1>We couldn't load the featured titles</h1>
          <p className="hero-overview">{describeError(slides.error)}</p>
          <button type="button" className="btn btn-light" onClick={slides.retry}>Try again</button>
        </div>
      </section>
    )
  }
  if (!item) return <section className="hero hero-empty skeleton" aria-busy="true" aria-label="Loading featured titles" />

  const saved = has(item)
  const genres = (item.genres || []).map((id) => names.data?.[id]).filter(Boolean).slice(0, 3)

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="hero-slide" key={item.key}>
        <picture>
          <source media="(max-width: 700px)" srcSet={img(item.poster, 'w780')} />
          <img className="hero-image" src={img(item.backdrop, 'w1280')} alt="" fetchpriority={index === 0 ? 'high' : 'auto'} />
        </picture>
      </div>
      <div className="hero-shade" />

      <div className="hero-content">
        <span className="hero-label"><span className="hero-n">N</span>{label}</span>
        <h1 className="hero-title">{item.title}</h1>
        <p className="hero-meta">
          {item.rating > 0 && <span className="match">{Math.round(item.rating * 10)}% match</span>}
          {year(item) && <span>{year(item)}</span>}
          <span className="kind">{item.type === 'tv' ? 'TV Series' : 'Movie'}</span>
          {genres.map((name) => <span key={name} className="hero-genre">{name}</span>)}
        </p>
        <p className="hero-overview">{item.overview}</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-light" onClick={() => open(item, { play: true })}><Icon name="play" size={20} /> Play trailer</button>
          <button type="button" className="btn btn-glass" onClick={() => open(item)}><Icon name="info" size={20} /> More info</button>
          <button type="button" className="round big" aria-pressed={saved} aria-label={saved ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
            onClick={() => notify(toggle(item) ? `Added "${item.title}" to My List` : `Removed "${item.title}" from My List`)}>
            <Icon name={saved ? 'check' : 'plus'} size={20} />
          </button>
        </div>
      </div>

      {items.length > 1 && (
        <div className="hero-dots" role="group" aria-label="Choose a featured title">
          {items.map((slide, n) => (
            <button key={slide.key} type="button" className={`dot ${n === index ? 'on' : ''}`} onClick={() => setIndex(n)}
              aria-label={`Show ${slide.title}`} aria-current={n === index} />
          ))}
        </div>
      )}
    </section>
  )
}
