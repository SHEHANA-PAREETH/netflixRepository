import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLibrary } from '../context/Library'
import { useToast } from '../context/Toast'
import { useDebounce } from '../hooks/useDebounce'
import Icon from './Icon'

const LINKS = [
  ['/', 'Home'],
  ['/tv', 'TV Shows'],
  ['/movies', 'Movies'],
  ['/new', 'New & Popular'],
  ['/my-list', 'My List'],
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { list, clearAll } = useLibrary()
  const notify = useToast()
  const onSearchPage = location.pathname === '/search'

  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(onSearchPage)
  const [text, setText] = useState(onSearchPage ? params.get('q') || '' : '')
  const debounced = useDebounce(text, 400)
  const input = useRef(null)
  const menu = useRef(null)

  // transparent over the hero, solid once you scroll
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // going to another page closes the menu and clears the search box
  useEffect(() => {
    setMenuOpen(false)
    if (location.pathname !== '/search') { setSearchOpen(false); setText('') }
  }, [location.pathname])

  // typing searches by itself once you pause
  useEffect(() => {
    if (!searchOpen) return
    const trimmed = debounced.trim()
    if (trimmed && !(onSearchPage && trimmed === (params.get('q') || ''))) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: onSearchPage })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  useEffect(() => { if (searchOpen) input.current?.focus() }, [searchOpen])

  // close the profile menu on an outside click or Escape
  useEffect(() => {
    if (!menuOpen) return undefined
    const onDown = (event) => { if (menu.current && !menu.current.contains(event.target)) setMenuOpen(false) }
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  const submit = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }
  const toggleSearch = () => {
    if (searchOpen && !text) setSearchOpen(false)
    else if (searchOpen) input.current?.focus()
    else setSearchOpen(true)
  }
  const onSearchKey = (event) => {
    if (event.key === 'Escape') { setText(''); setSearchOpen(false); if (onSearchPage) navigate('/') }
  }
  const [confirming, setConfirming] = useState(false)
  const reset = () => { setMenuOpen(false); setConfirming(true) }
  const confirmReset = () => {
    clearAll()
    setConfirming(false)
    notify('Your list and history were cleared')
  }

  useEffect(() => {
    if (!confirming) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setConfirming(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [confirming])

  return (
    <header className={`navbar ${solid ? 'solid' : ''} ${searchOpen ? 'searching' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="Netflix Clone home">NETFLIX</Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{label}</NavLink>
          ))}
        </nav>

        <div className="nav-tools">
          <form className={`nav-search ${searchOpen ? 'open' : ''}`} onSubmit={submit} role="search" aria-label="Search titles">
            <button type="button" className="icon-btn" onClick={toggleSearch} aria-label={searchOpen ? 'Close search' : 'Open search'} aria-expanded={searchOpen}>
              <Icon name="search" size={22} />
            </button>
            <input ref={input} type="search" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={onSearchKey}
              placeholder="Titles, people, genres" aria-label="Search for movies and TV shows" autoComplete="off" tabIndex={searchOpen ? 0 : -1} />
          </form>

          <div className="profile" ref={menu}>
            <button type="button" className="profile-btn" onClick={() => setMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Profile and menu">
              <span className="avatar" aria-hidden="true"><Icon name="user" size={18} /></span>
              <span className="caret" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="menu" role="menu">
                {/* on phones and tablets the page links live here, so there is only one menu button */}
                <div className="menu-pages">
                  {LINKS.map(([to, label]) => (
                    <NavLink key={to} to={to} end={to === '/'} role="menuitem" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                      {label}{to === '/my-list' && list.length > 0 ? <span className="count">{list.length}</span> : null}
                    </NavLink>
                  ))}
                  <hr />
                </div>
                <Link to="/my-list" role="menuitem" className="menu-item menu-desktop">
                  <Icon name="heart" size={18} /> My List {list.length > 0 && <span className="count">{list.length}</span>}
                </Link>
                <button type="button" role="menuitem" className="menu-item" onClick={reset}><Icon name="clock" size={18} /> Clear my list and history</button>
                <p className="menu-note">Your list is saved in this browser only.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirming && createPortal(
        <div className="modal-backdrop confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirming(false) }}>
          <div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
            <h2 id="confirm-title">Clear your list?</h2>
            <p id="confirm-text">This removes everything from My List and Recently viewed on this device. It can't be undone.</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)} autoFocus>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmReset}>Clear everything</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}
