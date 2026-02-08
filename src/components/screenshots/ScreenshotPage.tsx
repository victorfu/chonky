import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScreenshotStore } from '@/stores/useScreenshotStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/useToast';
import { ScreenshotDropzone } from './ScreenshotDropzone';
import { FloatingCommandBar } from './FloatingCommandBar';
import { AnalysisResult } from './AnalysisResult';
import type { ModelType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  saveDraftImage,
  loadDraftImage,
  savePendingAnalysis,
  loadPendingAnalysis,
  clearPendingAnalysis,
  migrateLegacyKeys,
} from '@/services/screenshotStorage';

export function ScreenshotPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { warning } = useToast();
  const resumeAttempted = useRef(false);
  const skipDraftRestoreRef = useRef(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    currentImage,
    analysisResult,
    streamingResult,
    isAnalyzing,
    selectedMode,
    selectedModel,
    error,
    resultType,
    processedImageData,
    setImage,
    clearImage,
    setMode,
    setModel,
    analyze,
  } = useScreenshotStore();

  const warnStorageFailed = useCallback(() => {
    warning(t('screenshot.errors.storageFailed', 'Could not save image locally. Your work may not persist if you navigate away.'), { duration: 6000 });
  }, [warning, t]);

  const persistAnalysisSnapshot = async (pendingAnalyze: boolean) => {
    const ok = await savePendingAnalysis({
      image: currentImage,
      mode: selectedMode,
      model: selectedModel,
      pendingAnalyze,
    });
    if (!ok) warnStorageFailed();
  };

  const handleSignIn = async () => {
    await persistAnalysisSnapshot(false);
    navigate('/login', { state: { from: location } });
  };

  const handleAnalyze = async () => {
    const requiresAuth = selectedMode !== 'remove-bg';

    // Keep current image resilient to unexpected refresh during heavy image processing.
    const draftOk = saveDraftImage(currentImage);

    if (!isAuthenticated && requiresAuth) {
      // Await both storage writes before navigating away to avoid unmount races.
      if (!(await draftOk)) warnStorageFailed();
      await persistAnalysisSnapshot(true);
      navigate('/login', { state: { from: location, pendingAnalyze: true } });
      return;
    }

    // Fire-and-forget when not navigating — don't block analysis.
    void draftOk.then((ok) => { if (!ok) warnStorageFailed(); });
    analyze();
  };

  const handleClear = () => {
    // Prevent immediate draft restoration on the next render after manual clear.
    skipDraftRestoreRef.current = true;
    void saveDraftImage(null).then((ok) => {
      if (!ok) console.error('[ScreenshotPage] Failed to clear draft image from storage');
    });
    clearImage();
  };

  useEffect(() => {
    migrateLegacyKeys();
  }, []);

  useEffect(() => {
    if (currentImage) return;
    if (skipDraftRestoreRef.current) {
      skipDraftRestoreRef.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, failed } = await loadDraftImage();
      if (cancelled || skipDraftRestoreRef.current) return;
      if (failed) {
        warnStorageFailed();
      } else if (data) {
        setImage(data);
      }
    })().catch((err) => {
      console.error('[ScreenshotPage] Failed to restore draft:', err);
    });
    return () => { cancelled = true; };
  }, [currentImage, setImage, warnStorageFailed]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;

    let cancelled = false;
    (async () => {
      const { data: pending, failed } = await loadPendingAnalysis();
      if (cancelled) return;
      if (failed) {
        warnStorageFailed();
        return;
      }
      if (!pending) return;

      if (pending.image && !currentImage) {
        setImage(pending.image);
      }
      if (pending.mode) {
        setMode(pending.mode);
      }
      if (pending.model) {
        setModel(pending.model);
      }

      const cleared = await clearPendingAnalysis();
      if (!cleared) {
        console.warn('[ScreenshotPage] clearPendingAnalysis failed; skipping auto-analyze to avoid stale replay');
        return;
      }

      if (pending.pendingAnalyze && pending.image) {
        setTimeout(analyze, 0);
      }
    })().catch((err) => {
      console.error('[ScreenshotPage] Failed to restore pending analysis:', err);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, currentImage, analyze, setImage, setMode, setModel, warnStorageFailed]);

  useEffect(() => {
    if (!currentImage) {
      void saveDraftImage(null).then((ok) => {
        if (!ok) console.error('[ScreenshotPage] Failed to clear draft image from storage');
      });
    }
  }, [currentImage]);

  // Handle paste event globally
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              setImage(result);
            };
            reader.readAsDataURL(blob);
          }
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [setImage]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
          <div className="pointer-events-none absolute -top-24 right-6 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-6 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-bold">
                  {t('screenshot.heroTitle', 'Explore images before you sign in')}
                </h1>
                <p className="mt-2 max-w-2xl text-base-content/60">
                  {t(
                    'screenshot.heroSubtitle',
                    'Drop a screenshot, pick a mode, and sign in only when you are ready to run analysis.'
                  )}
                </p>
              </div>
              {!isAuthenticated && (
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Button variant="secondary" onClick={handleSignIn}>
                    {t('screenshot.signInCta', 'Sign in')}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-base-300/60 bg-base-200/80 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">1</Badge>
                  <span className="font-semibold">
                    {t('screenshot.steps.upload.title', 'Drop an image')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-base-content/60">
                  {t('screenshot.steps.upload.description', 'Paste, drag, or choose a file to preview.')}
                </p>
              </div>
              <div className="rounded-xl border border-base-300/60 bg-base-200/80 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">2</Badge>
                  <span className="font-semibold">
                    {t('screenshot.steps.choose.title', 'Pick a mode')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-base-content/60">
                  {t('screenshot.steps.choose.description', 'Choose explain, OCR, translate, or cleanup.')}
                </p>
              </div>
              <div className="rounded-xl border border-base-300/60 bg-base-200/80 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">3</Badge>
                  <span className="font-semibold">
                    {t('screenshot.steps.analyze.title', 'Run analysis')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-base-content/60">
                  {t('screenshot.steps.analyze.description', 'Sign in only when you are ready to analyze.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dropzone */}
        <ScreenshotDropzone onImageSelect={setImage} currentImage={currentImage} />

        {/* Command Bar - sticky when image is present */}
        {currentImage && (
          <div className="sticky bottom-4 z-10">
            <FloatingCommandBar
              selectedMode={selectedMode}
              selectedModel={selectedModel}
              isAnalyzing={isAnalyzing}
              onModeChange={setMode}
              onModelChange={(value) => setModel(value as ModelType)}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
            />
          </div>
        )}

        {/* Result */}
        <AnalysisResult
          result={analysisResult}
          streamingResult={streamingResult}
          isAnalyzing={isAnalyzing}
          error={error}
          onReanalyze={handleAnalyze}
          resultType={resultType}
          processedImageData={processedImageData ?? undefined}
        />
      </div>
    </div>
  );
}
