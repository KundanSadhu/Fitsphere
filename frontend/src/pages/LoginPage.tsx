import { useState } from 'react';
import { Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      const msg = err.code === 'auth/popup-blocked'
        ? 'Popup was blocked. Please allow popups for this site and try again.'
        : err.code === 'auth/unauthorized-domain'
          ? 'This domain is not authorized. Please contact the administrator.'
          : err.message || 'Google sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border-2 border-theme rounded-[24px] shadow-brutal-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary border-2 border-primary shadow-brutal flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-theme uppercase tracking-tight">Welcome Back</h1>
          <p className="text-sm font-semibold text-theme-muted mt-2">
            Sign in with Google to access your dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950 border-2 border-theme rounded-xl text-rose-600 text-xs font-black shadow-brutal">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-card text-theme py-4 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-theme hover:bg-theme-secondary transition-all shadow-brutal active:translate-y-1 active:translate-x-1 active:shadow-none flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-theme border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
