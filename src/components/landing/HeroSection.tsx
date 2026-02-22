import { Trans, useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center px-4 pt-16 pb-8 text-center sm:pt-24 sm:pb-12">
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        <Trans
          i18nKey="landing.hero.title"
          components={{
            accent: <span className="italic text-accent" />,
          }}
        />
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
        {t('landing.hero.subtitle')}
      </p>
    </section>
  );
}
