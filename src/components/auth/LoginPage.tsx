import { useState } from 'react';
import { useNavigate, useLocation, type Location } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { Logo } from '@/components/ui/Logo';

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path
          fill="#4285F4"
          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
        />
        <path
          fill="#34A853"
          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
        />
        <path
          fill="#FBBC05"
          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
        />
        <path
          fill="#EA4335"
          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
        />
      </g>
    </svg>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const appName = import.meta.env.VITE_APP_NAME || 'App';

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getReturnPath = (from: unknown) => {
    if (!from) return '/admin/knowledge-base';
    if (typeof from === 'string') return from;
    if (typeof from === 'object' && 'pathname' in from) {
      const loc = from as Location;
      return `${loc.pathname ?? ''}${loc.search ?? ''}${loc.hash ?? ''}` || '/admin/knowledge-base';
    }
    return '/admin/knowledge-base';
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        const from = (location.state as { from?: Location | string } | null)?.from;
        navigate(getReturnPath(from), { replace: true });
      } else if (result.error) {
        setError(t(result.error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(80% 70% at 15% 0%, color-mix(in oklch, var(--accent) 16%, transparent), transparent 58%), radial-gradient(80% 70% at 85% 0%, color-mix(in oklch, var(--info) 16%, transparent), transparent 58%)',
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.welcome', { appName })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.tagline')}</p>
        </div>

        <div className="glass-floating rounded-2xl p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-[10px] border border-destructive/25 bg-destructive/12 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-border-hairline bg-background-elevated/80 px-4 text-sm font-medium shadow-sm transition-all motion-safe:duration-200 hover:bg-background-elevated disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon />
            )}
            <span>
              {t('auth.signInWithGoogle')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
