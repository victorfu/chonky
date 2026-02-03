import { useState } from 'react';
import { Copy, Check, RefreshCw, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AnalysisResultType } from '@/types/screenshot';

interface AnalysisResultProps {
  result: string;
  streamingResult: string;
  isAnalyzing: boolean;
  error: string | null;
  onReanalyze: () => void;
  resultType?: AnalysisResultType;
  processedImageData?: string;
}

export function AnalysisResult({
  result,
  streamingResult,
  isAnalyzing,
  error,
  onReanalyze,
  resultType = 'text',
  processedImageData,
}: AnalysisResultProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const displayContent = streamingResult || result;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!processedImageData) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${processedImageData}`;
    link.download = `processed-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Card className="border-error/30 bg-error/5">
        <div className="flex items-center gap-3 text-error">
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!displayContent && !isAnalyzing && !processedImageData) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          {isAnalyzing && <LoadingSpinner size="sm" />}
          {t('screenshot.result', 'Analysis Result')}
        </h3>
        <div className="flex gap-2">
          {processedImageData && (
            <IconButton
              icon={<Download className="w-4 h-4" />}
              aria-label={t('common.download', 'Download')}
              size="sm"
              onClick={handleDownload}
              tooltip={t('common.download', 'Download')}
            />
          )}
          {displayContent && (
            <IconButton
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              aria-label={t('common.copy', 'Copy')}
              size="sm"
              onClick={handleCopy}
              tooltip={t('common.copy', 'Copy')}
            />
          )}
          <IconButton
            icon={<RefreshCw className="w-4 h-4" />}
            aria-label={t('screenshot.reanalyze', 'Reanalyze')}
            size="sm"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            tooltip={t('screenshot.reanalyze', 'Reanalyze')}
          />
        </div>
      </div>

      {resultType === 'image' && processedImageData && (
        <div className="mb-4">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 bg-repeat"
              style={{
                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            />
            <img
              src={`data:image/png;base64,${processedImageData}`}
              alt="Processed result"
              className="relative max-w-full max-h-96 rounded-lg"
            />
          </div>
        </div>
      )}

      {displayContent && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
      )}
    </Card>
  );
}
