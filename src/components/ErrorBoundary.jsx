import { Component } from 'react'

// Catches any render crash and shows an actionable message instead of a
// blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-canvas, #fbfbfd)', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 460, textAlign: 'center', background: 'var(--color-white, #fff)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: 24 }}>⚠</div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink, #1d1d1f)', margin: '0 0 8px' }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#6e6e73', margin: '0 0 20px' }}>The app hit an unexpected error. Reloading usually fixes it.</p>
            <pre style={{ fontSize: 11, color: '#9ca3af', background: 'rgba(0,0,0,0.04)', padding: 12, borderRadius: 12, overflow: 'auto', textAlign: 'left', maxHeight: 140, margin: '0 0 20px' }}>{String(this.state.error?.message || this.state.error)}</pre>
            <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
              style={{ background: '#7c3aed', color: '#fff', border: 0, borderRadius: 9999, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
