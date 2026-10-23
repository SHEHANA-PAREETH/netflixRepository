import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch(error) { console.error(error) }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="notice page-notice">
        <h1>Something went wrong</h1>
        <p>An unexpected error stopped this page from showing.</p>
        <a className="btn btn-light" href="/">Back to home</a>
      </div>
    )
  }
}
