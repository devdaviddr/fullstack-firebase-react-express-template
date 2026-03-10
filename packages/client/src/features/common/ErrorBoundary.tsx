import React, { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Generic error boundary component that can be reused throughout the app.
// It captures rendering errors in its subtree and displays a fallback UI.
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can log the error to an external service here
    console.error('ErrorBoundary caught an error', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // default fallback UI
      return (
        <div className="flex h-screen flex-col items-center justify-center p-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Something went wrong.
          </h1>
          <p className="mb-6 text-gray-600">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
