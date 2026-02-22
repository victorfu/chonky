import { useTranslation } from 'react-i18next';
import { AtSign, Share2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function LandingFooter() {
  const { t } = useTranslation();
  const appName = import.meta.env.VITE_APP_NAME || 'Chonky';

  return (
    <footer className="border-t border-border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
        {/* Left: Logo + copyright */}
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-sm font-semibold">{appName}</span>
          <span className="text-xs text-muted-foreground">
            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
          </span>
        </div>

        {/* Right: Links + social */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            {t('landing.footer.privacy')}
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            {t('landing.footer.terms')}
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            {t('landing.footer.help')}
          </a>
          <div className="flex items-center gap-2">
            <a href="#" className="transition-colors hover:text-foreground">
              <AtSign className="h-4 w-4" />
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
