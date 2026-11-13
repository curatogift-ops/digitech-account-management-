import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ padding: 28 }}>
          <div className="empty empty-error">
            <strong>Something went wrong</strong>
            <p>{this.state.error.message || 'Unexpected error'}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
