import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface PlanFeature {
  key: string;
}

interface Plan {
  nameKey: string;
  priceKey: string;
  periodKey?: string;
  descKey: string;
  features: PlanFeature[];
  ctaKey: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    nameKey: 'landing.pricing.plans.free.name',
    priceKey: 'landing.pricing.plans.free.price',
    descKey: 'landing.pricing.plans.free.desc',
    features: [
      { key: 'landing.pricing.plans.free.features.f1' },
      { key: 'landing.pricing.plans.free.features.f2' },
      { key: 'landing.pricing.plans.free.features.f3' },
      { key: 'landing.pricing.plans.free.features.f4' },
    ],
    ctaKey: 'landing.pricing.plans.free.cta',
  },
  {
    nameKey: 'landing.pricing.plans.pro.name',
    priceKey: 'landing.pricing.plans.pro.price',
    periodKey: 'landing.pricing.plans.pro.period',
    descKey: 'landing.pricing.plans.pro.desc',
    features: [
      { key: 'landing.pricing.plans.pro.features.f1' },
      { key: 'landing.pricing.plans.pro.features.f2' },
      { key: 'landing.pricing.plans.pro.features.f3' },
      { key: 'landing.pricing.plans.pro.features.f4' },
      { key: 'landing.pricing.plans.pro.features.f5' },
    ],
    ctaKey: 'landing.pricing.plans.pro.cta',
    popular: true,
  },
  {
    nameKey: 'landing.pricing.plans.team.name',
    priceKey: 'landing.pricing.plans.team.price',
    periodKey: 'landing.pricing.plans.team.period',
    descKey: 'landing.pricing.plans.team.desc',
    features: [
      { key: 'landing.pricing.plans.team.features.f1' },
      { key: 'landing.pricing.plans.team.features.f2' },
      { key: 'landing.pricing.plans.team.features.f3' },
      { key: 'landing.pricing.plans.team.features.f4' },
      { key: 'landing.pricing.plans.team.features.f5' },
      { key: 'landing.pricing.plans.team.features.f6' },
    ],
    ctaKey: 'landing.pricing.plans.team.cta',
  },
];

export function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('landing.pricing.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t('landing.pricing.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.nameKey}
            className={cn(
              'relative flex flex-col rounded-2xl border p-6 transition-shadow',
              plan.popular
                ? 'border-accent/40 bg-card/80 shadow-elevated backdrop-blur-sm'
                : 'border-border-hairline bg-card/60 backdrop-blur-sm hover:shadow-card-hover'
            )}
          >
            {/* Popular badge */}
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">
                {t('landing.pricing.popular')}
              </span>
            )}

            {/* Plan header */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{t(plan.nameKey)}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{t(plan.priceKey)}</span>
                {plan.periodKey && (
                  <span className="text-sm text-muted-foreground">{t(plan.periodKey)}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t(plan.descKey)}</p>
            </div>

            {/* Feature list */}
            <ul className="mb-8 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature.key} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                  <span>{t(feature.key)}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant={plan.popular ? 'default' : 'secondary'}
              className="w-full rounded-lg"
              asChild
            >
              <Link to="/login">{t(plan.ctaKey)}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
