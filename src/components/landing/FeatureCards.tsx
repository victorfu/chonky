import { useTranslation } from 'react-i18next';
import { Zap, Shield, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';

const features = [
  {
    icon: Zap,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    titleKey: 'landing.features.instantAnswers.title',
    descKey: 'landing.features.instantAnswers.desc',
  },
  {
    icon: Shield,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    titleKey: 'landing.features.privateSecure.title',
    descKey: 'landing.features.privateSecure.desc',
  },
  {
    icon: Globe,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    titleKey: 'landing.features.globalSearch.title',
    descKey: 'landing.features.globalSearch.desc',
  },
];

export function FeatureCards() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.titleKey}
              className="rounded-xl border border-border-hairline bg-card/60 p-6 backdrop-blur-sm"
            >
              <div
                className={cn(
                  'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg',
                  f.iconBg
                )}
              >
                <Icon className={cn('h-5 w-5', f.iconColor)} />
              </div>
              <h3 className="mb-1 text-base font-semibold">{t(f.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
