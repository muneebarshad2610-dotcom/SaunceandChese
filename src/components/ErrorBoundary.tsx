import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Flame } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    const s = (this as any).state as State;
    const p = (this as any).props as Props;

    if (s.hasError) {
      if (p.fallback) return p.fallback;

      return (
        <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border-4 border-[#C41E3A] rounded-[40px] p-10 text-center space-y-6 shadow-xl">
            <div className="w-20 h-20 bg-[#C41E3A]/10 rounded-full flex items-center justify-center mx-auto border-4 border-[#C41E3A]/20">
              <Flame className="w-10 h-10 text-[#C41E3A]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-retro text-4xl text-[#C41E3A] uppercase tracking-wide">
                Oops! Something Melted
              </h2>
              <p className="text-[#C41E3A]/70 font-medium">
                Our kitchen hit a snag. The page went a little too gooey.
              </p>
            </div>

            {s.error && (
              <p className="text-xs font-mono text-[#C41E3A]/50 bg-[#C41E3A]/5 p-3 rounded-xl border border-[#C41E3A]/10 break-words max-h-24 overflow-y-auto">
                {s.error.message}
              </p>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-[#FFB81C] text-[#C41E3A] font-black px-8 py-3 rounded-full uppercase tracking-widest text-sm border-2 border-[#C41E3A] hover:bg-[#ffa71c] transition-all cursor-pointer"
            >
              Reload the Feast
            </button>
          </div>
        </div>
      );
    }

    return p.children;
  }
}
