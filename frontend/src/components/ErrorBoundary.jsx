import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass rounded-3xl p-10 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-rose-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-400 text-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button onClick={this.handleReset} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
