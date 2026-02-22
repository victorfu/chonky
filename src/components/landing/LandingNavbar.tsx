import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useTheme } from '@/hooks/useTheme';

export function LandingNavbar() {
  const { t } = useTranslation();
  const { isDark, setThemeLocal } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appName = import.meta.env.VITE_APP_NAME || 'Chonky';

  const toggleTheme = () => {
    setThemeLocal(isDark ? 'light' : 'dark');
  };

  const navLinks = [
    { label: t('landing.nav.howItWorks'), href: '#how-it-works' },
    { label: t('landing.nav.useCases'), href: '#use-cases' },
    { label: t('landing.nav.pricing'), href: '#pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border-hairline bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + App name */}
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-lg font-semibold">{appName}</span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Theme toggle + Auth (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <IconButton
            icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            size="sm"
          />
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('landing.nav.logIn')}
          </Link>
          <Button variant="default" className="rounded-full" asChild>
            <Link to="/login">{t('landing.nav.getStarted')}</Link>
          </Button>
        </div>

        {/* Mobile: hamburger + theme toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <IconButton
            icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            size="sm"
          />
          <IconButton
            icon={
              mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )
            }
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            size="sm"
          />
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border-hairline bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="my-1 h-px bg-border-hairline" />
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
            >
              {t('landing.nav.logIn')}
            </Link>
            <Button variant="default" className="mt-1 rounded-full" asChild>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                {t('landing.nav.getStarted')}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
