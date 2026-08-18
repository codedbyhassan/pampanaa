import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Pampanaa] Unhandled renderer error.', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '32px',
          background: '#070a12',
          color: '#f5f7ff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <section style={{ maxWidth: 560 }}>
          <p style={{ opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Pampanaa
          </p>
          <h1>Something went wrong</h1>
          <p style={{ opacity: 0.75 }}>
            The renderer hit an unexpected error. Your local progress should remain untouched.
          </p>
          <button type="button" onClick={this.handleReload}>
            Reload Pampanaa
          </button>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre style={{ marginTop: 24, textAlign: 'left', whiteSpace: 'pre-wrap' }}>
              {this.state.error.message}
            </pre>
          ) : null}
        </section>
      </main>
    );
  }
}
