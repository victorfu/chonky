import { useTranslation } from 'react-i18next';
import { MessageSquareText, Brain, FileOutput } from 'lucide-react';
import { cn } from '@/utils/cn';

const steps = [
  {
    step: 1,
    icon: MessageSquareText,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    titleKey: 'landing.howItWorks.steps.ask.title',
    descKey: 'landing.howItWorks.steps.ask.desc',
  },
  {
    step: 2,
    icon: Brain,
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    titleKey: 'landing.howItWorks.steps.analyze.title',
    descKey: 'landing.howItWorks.steps.analyze.desc',
  },
  {
    step: 3,
    icon: FileOutput,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    titleKey: 'landing.howItWorks.steps.deliver.title',
    descKey: 'landing.howItWorks.steps.deliver.desc',
  },
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('landing.howItWorks.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t('landing.howItWorks.subtitle')}
        </p>
      </div>

      <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
        {/* Connector line (desktop only) */}
        <div className="pointer-events-none absolute top-14 right-[calc(33.33%+12px)] left-[calc(33.33%-12px)] hidden h-px bg-border-hairline sm:block" />

        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              {/* Step number badge */}
              <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {s.step}
              </span>

              {/* Icon */}
              <div
                className={cn(
                  'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                  s.iconBg
                )}
              >
                <Icon className={cn('h-6 w-6', s.iconColor)} strokeWidth={1.5} />
              </div>

              <h3 className="mb-1 text-base font-semibold">{t(s.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
