import { useCallback, useRef } from 'react';
import { Upload, Clipboard, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/cn';

interface ScreenshotDropzoneProps {
  onImageSelect: (base64: string) => void;
  currentImage: string | null;
}

export function ScreenshotDropzone({ onImageSelect, currentImage }: ScreenshotDropzoneProps) {
  const { t } = useTranslation();
  const { error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        error(t('screenshot.invalidFileType', 'Please select an image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
      };
      reader.onerror = () => {
        error(t('screenshot.readError', 'Failed to read file'));
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, error, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            onImageSelect(result);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      error(t('screenshot.noImageInClipboard', 'No image found in clipboard'));
    } catch {
      error(t('screenshot.clipboardError', 'Failed to read from clipboard'));
    }
  }, [onImageSelect, error, t]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  if (currentImage) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-base-300">
        <img
          src={currentImage}
          alt="Screenshot preview"
          className="w-full max-h-[400px] object-contain bg-base-200"
        />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        'border-2 border-dashed border-base-300 rounded-xl',
        'p-8 text-center transition-colors',
        'hover:border-primary hover:bg-primary/5'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-base-200 rounded-full">
          <ImageIcon className="w-8 h-8 text-base-content/50" />
        </div>

        <div>
          <p className="font-medium text-base-content">
            {t('screenshot.dropzone.title', 'Drop image here')}
          </p>
          <p className="text-sm text-base-content/60 mt-1">
            {t('screenshot.dropzone.subtitle', 'or use the buttons below')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            leftIcon={<Clipboard className="w-4 h-4" />}
            onClick={handlePaste}
          >
            {t('screenshot.pasteFromClipboard', 'Paste from Clipboard')}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={handleFileSelect}
          >
            {t('screenshot.selectFile', 'Select File')}
          </Button>
        </div>

        <p className="text-xs text-base-content/50">
          {t('screenshot.shortcut', 'Tip: Press Ctrl+V to paste directly')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
