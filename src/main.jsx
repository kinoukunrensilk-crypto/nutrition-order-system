import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 30, color: '#990000', background: '#fff0f0', border: '2px solid red', margin: 20, borderRadius: 12, fontFamily: 'sans-serif' }}>
          <h2>⚠️ システム描画エラーが発生しました</h2>
          <p style={{ fontSize: 14 }}>以下のエラー内容をご確認ください：</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#eee', padding: 10, borderRadius: 8 }}>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (err) {
  document.getElementById('root').innerHTML = '<div style="padding:30px;color:red;"><h2>起動致命的エラー</h2><pre>' + err.toString() + '</pre></div>';
}
