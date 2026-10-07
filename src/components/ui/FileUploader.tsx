'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

export interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  maxSizeMB?: number;
  accept?: string;
  error?: string;
}

export function FileUploader({
  onFileSelect,
  selectedFile,
  maxSizeMB = 50,
  accept = '.pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.zip,.mp4,.yml,.yaml,.txt',
  error
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setLocalError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size exceeds ${maxSizeMB}MB limit (${formatFileSize(file.size)})`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeError = error || localError;

  return (
    <div className="w-full space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3',
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60',
          activeError && 'border-rose-500/80 bg-rose-500/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click to browse or drag & drop output file
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PDF, DOCX, ZIP, PNG, JPG, MP4 (Max {maxSizeMB}MB)
              </p>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <FileIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Ready
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {activeError && <p className="text-xs text-rose-400 font-medium">{activeError}</p>}
    </div>
  );
}
