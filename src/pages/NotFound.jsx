import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found – Netflix Clone' }, [])
  return (
    <div className="page">
      <div className="notice page-notice">
        <p className="big-code">404</p>
        <h1>Lost your way?</h1>
        <p>There's nothing at this address.</p>
        <Link className="btn btn-light" to="/">Netflix Home</Link>
      </div>
    </div>
  )
}
