import { useTranslation } from 'react-i18next';
import { GraduationCap, Briefcase, FlaskConical, PenLine } from 'lucide-react';
import { cn } from '@/utils/cn';

const cases = [
  {
    icon: GraduationCap,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    titleKey: 'landing.useCases.items.research.title',
    descKey: 'landing.useCases.items.research.desc',
  },
  {
    icon: Briefcase,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    titleKey: 'landing.useCases.items.business.title',
    descKey: 'landing.useCases.items.business.desc',
  },
  {
    icon: FlaskConical,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    titleKey: 'landing.useCases.items.data.title',
    descKey: 'landing.useCases.items.data.desc',
  },
  {
    icon: PenLine,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    titleKey: 'landing.useCases.items.content.title',
    descKey: 'landing.useCases.items.content.desc',
  },
];

export function UseCases() {
  const { t } = useTranslation();

  return (
    <section id="use-cases" className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('landing.useCases.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t('landing.useCases.subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cases.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.titleKey}
              className="group rounded-xl border border-border-hairline bg-card/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
                    c.iconBg
                  )}
                >
                  <Icon className={cn('h-5 w-5', c.iconColor)} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">{t(c.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(c.descKey)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
