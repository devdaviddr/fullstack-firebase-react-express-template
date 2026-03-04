import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  // React dev-mode calls console.error AND jsdom logs the raw exception to
  // process.stderr via its own reportException path.  Both need suppressing:
  //  1. console.error mock  – stops React's "The above error occurred…" output
  //  2. window 'error' listener with preventDefault() – stops jsdom's
  //     "Error: Uncaught [Error: boom]" block (jsdom respects defaultPrevented)
  const suppressUncaught = (e: ErrorEvent) => e.preventDefault();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    window.addEventListener('error', suppressUncaught);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.removeEventListener('error', suppressUncaught);
  });

  it('shows fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>all good</div>
      </ErrorBoundary>
    );
    expect(screen.getByText(/all good/)).toBeInTheDocument();
  });
});
