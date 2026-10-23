import { useEffect, useRef, useState } from 'react'
import { describeError, getDetails, img, year } from '../api/tmdb'
import { useLibrary } from '../context/Library'
import { useTitleModal } from '../context/TitleModal'
import { useToast } from '../context/Toast'
import { useFetch } from '../hooks/useFetch'
import Icon from './Icon'

// the details window: trailer, facts, cast and similar titles. Open state lives in the URL.
export default function TitleModal() {
  const { current, close, open } = useTitleModal()
  if (!current) return null
  return <Dialog key={`${current.type}-${current.id}`} current={current} close={close} open={open} />
}

function Dialog({ current, close, open }) {
  const { has, toggle, addRecent } = useLibrary()
  const notify = useToast()
  const [playing, setPlaying] = useState(current.play)
  const panel = useRef(null)
  const opener = useRef(document.activeElement)
  const details = useFetch(() => getDetails(current.type, current.id), [current.type, current.id])
  const item = details.data

  useEffect(() => { if (item) addRecent(item) }, [item]) // eslint-disable-line react-hooks/exhaustive-deps

  // lock page scroll, close on Escape, keep Tab inside the window, give focus back afterwards
  useEffect(() => {
    const previous = opener.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') { close(); return }
      if (event.key !== 'Tab' || !panel.current) return
      const focusable = [...panel.current.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (previous && document.contains(previous)) previous.focus?.()
    }
  }, [close])

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: item?.title, url })
      else { await navigator.clipboard.writeText(url); notify('Link copied') }
    } catch (problem) {
      if (problem?.name !== 'AbortError') notify("Couldn't copy the link")
    }
  }

  const saved = item ? has(item) : false
  const facts = item ? [
    item.certification && <span key="c" className="cert">{item.certification}</span>,
    year(item) && <span key="y">{year(item)}</span>,
    item.runtime > 0 && <span key="r">{item.runtime >= 60 ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : `${item.runtime}m`}</span>,
    item.type === 'tv' && item.seasons > 0 && <span key="s">{item.seasons} season{item.seasons > 1 ? 's' : ''}</span>,
  ].filter(Boolean) : []

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={item?.title || 'Title details'} tabIndex={-1} ref={panel}>
        <button type="button" className="modal-close" onClick={close} aria-label="Close details"><Icon name="close" size={20} /></button>

        {details.error ? (
          <div className="modal-error">
            <p>{describeError(details.error)}</p>
            <button type="button" className="btn btn-light" onClick={details.retry}>Try again</button>
          </div>
        ) : !item ? (
          <div className="modal-loading skeleton" aria-busy="true" aria-label="Loading details" />
        ) : (
          <>
            <div className="modal-media">
              {playing && item.trailerKey ? (
                <iframe title={`${item.title} trailer`} src={`https://www.youtube-nocookie.com/embed/${item.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              ) : (
                <>
                  {(item.backdrop || item.poster) && <img src={img(item.backdrop || item.poster, 'w780')} alt="" />}
                  <div className="modal-shade" />
                  <div className="modal-head">
                    <h2 className="modal-title">{item.title}</h2>
                    <div className="hero-actions">
                      {item.trailerKey
                        ? <button type="button" className="btn btn-light" onClick={() => setPlaying(true)}><Icon name="play" size={20} /> Play trailer</button>
                        : <span className="no-trailer">No trailer available</span>}
                      <button type="button" className="round big" aria-pressed={saved} aria-label={saved ? 'Remove from My List' : 'Add to My List'}
                        onClick={() => notify(toggle(item) ? `Added "${item.title}" to My List` : `Removed "${item.title}" from My List`)}>
                        <Icon name={saved ? 'check' : 'plus'} size={20} />
                      </button>
                      <button type="button" className="round big" aria-label="Share" onClick={share}><Icon name="share" size={20} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-body">
              {playing && item.trailerKey && <h2 className="modal-title small">{item.title}</h2>}
              <div className="modal-grid">
                <div>
                  <p className="hero-meta">
                    {item.rating > 0 && <span className="match">{Math.round(item.rating * 10)}% match</span>}
                    {facts}
                  </p>
                  {item.tagline && <p className="tagline">{item.tagline}</p>}
                  <p className="modal-overview">{item.overview || 'No description available.'}</p>
                </div>
                <dl className="facts">
                  {item.genreNames.length > 0 && <><dt>Genres</dt><dd>{item.genreNames.join(', ')}</dd></>}
                  {item.director && <><dt>{item.type === 'tv' ? 'Created by' : 'Director'}</dt><dd>{item.director}</dd></>}
                  {item.cast.length > 0 && <><dt>Starring</dt><dd>{item.cast.slice(0, 4).map((person) => person.name).join(', ')}</dd></>}
                  {item.status && <><dt>Status</dt><dd>{item.status}</dd></>}
                </dl>
              </div>

              {item.cast.length > 0 && (
                <section aria-label="Cast">
                  <h3>Cast</h3>
                  <ul className="cast">
                    {item.cast.map((person) => (
                      <li key={person.id}>
                        {person.photo ? <img src={img(person.photo, 'w185')} alt="" loading="lazy" /> : <span className="cast-fallback"><Icon name="user" size={28} /></span>}
                        <strong>{person.name}</strong>
                        <span>{person.role}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {item.similar.length > 0 && (
                <section aria-label="More like this">
                  <h3>More like this</h3>
                  <div className="similar">
                    {item.similar.map((entry) => (
                      <button type="button" key={entry.key} className="similar-card" onClick={() => { panel.current?.scrollTo?.({ top: 0 }); open(entry) }}>
                        <img src={img(entry.poster, 'w342')} alt="" loading="lazy" />
                        <span>{entry.title}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
