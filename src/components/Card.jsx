import { img, year } from '../api/tmdb'
import { useLibrary } from '../context/Library'
import { useToast } from '../context/Toast'
import { useTitleModal } from '../context/TitleModal'
import Icon from './Icon'

// variants: poster (tall), backdrop (wide), top10 (big number + poster)
export default function Card({ item, variant = 'poster', rank }) {
  const { open } = useTitleModal()
  const { has, toggle } = useLibrary()
  const notify = useToast()
  const saved = has(item)
  const wide = variant === 'backdrop'
  const picture = wide ? img(item.backdrop || item.poster, 'w500') : img(item.poster || item.backdrop, 'w342')

  const onToggle = (event) => {
    event.stopPropagation()
    const added = toggle(item)
    notify(added ? `Added "${item.title}" to My List` : `Removed "${item.title}" from My List`)
  }

  return (
    <article className={`card card-${variant}`}>
      {variant === 'top10' && <span className="rank" aria-hidden="true">{rank}</span>}
      <div className="card-frame">
        <button type="button" className="card-main" onClick={() => open(item)} aria-label={`${item.title}${year(item) ? `, ${year(item)}` : ''}. Open details`}>
          {picture
            ? <img src={picture} alt="" loading="lazy" decoding="async" />
            : <span className="card-fallback">{item.title}</span>}
        </button>
        <div className="card-hover">
          <div className="card-actions">
            <button type="button" className="round primary" onClick={() => open(item, { play: true })} aria-label={`Play trailer of ${item.title}`}><Icon name="play" size={16} /></button>
            <button type="button" className="round" onClick={onToggle} aria-pressed={saved} aria-label={saved ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}>
              <Icon name={saved ? 'check' : 'plus'} size={16} />
            </button>
            <button type="button" className="round more" onClick={() => open(item)} aria-label={`More about ${item.title}`}><Icon name="info" size={16} /></button>
          </div>
          <strong className="card-title">{item.title}</strong>
          <span className="card-meta">
            {item.rating > 0 && <span className="match">{Math.round(item.rating * 10)}% match</span>}
            {year(item) && <span>{year(item)}</span>}
            <span className="kind">{item.type === 'tv' ? 'TV' : 'Movie'}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
