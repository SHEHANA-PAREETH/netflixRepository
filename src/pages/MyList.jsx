import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { useLibrary } from '../context/Library'

export default function MyList() {
  const { list, recent } = useLibrary()
  const [filter, setFilter] = useState('all')
  useEffect(() => { document.title = 'My List – Netflix Clone' }, [])

  const shown = list.filter((item) => filter === 'all' || item.type === filter)

  return (
    <div className="page">
      <div className="toolbar">
        <h1>My List</h1>
        {list.length > 0 && (
          <div className="chips" role="group" aria-label="Filter list">
            {[['all', 'All'], ['movie', 'Movies'], ['tv', 'TV Shows']].map(([value, name]) => (
              <button key={value} type="button" className={`chip ${filter === value ? 'on' : ''}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>{name}</button>
            ))}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="notice">
          <h2>Your list is empty</h2>
          <p>Tap the + on any title to save it here. It's stored in this browser, no account needed.</p>
          <Link className="btn btn-light" to="/">Find something to watch</Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="notice"><p>Nothing of this kind in your list yet.</p></div>
      ) : (
        <div className="grid">{shown.map((item) => <Card key={item.key} item={item} />)}</div>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently viewed</h2>
          <div className="grid">{recent.map((item) => <Card key={item.key} item={item} />)}</div>
        </>
      )}
    </div>
  )
}
