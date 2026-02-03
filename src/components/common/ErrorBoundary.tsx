import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Translation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Translation>
          {(t) => (
            <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-error mb-4" />
              <h2 className="text-lg font-semibold mb-2">{t('errors.generic')}</h2>
              <p className="text-base-content/60 mb-4 max-w-md">
                {this.state.error?.message || t('errors.generic')}
              </p>
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('errors.tryAgain')}
              </Button>
            </div>
          )}
        </Translation>
      );
    }

    return this.props.children;
  }
}
