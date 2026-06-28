'use client';

import { useCallback, useRef, useState } from 'react';

export interface ContentItem {
  type: 'image' | 'audio' | 'video';
  data: string;
  fileName: string;
  preview: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function useFileUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerFileUpload = useCallback(
    (
      ref: React.RefObject<HTMLInputElement | null>,
      _type: 'image' | 'audio' | 'video',
    ) => {
      ref.current?.click();
    },
    [],
  );

  const processFile = useCallback(
    async (file: File): Promise<ContentItem | null> => {
      if (file.size > MAX_FILE_SIZE) {
        console.warn('文件过大，已跳过:', file.name);
        return null;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let type: 'image' | 'audio' | 'video' = 'image';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';

      return {
        type,
        data: dataUrl,
        fileName: file.name,
        preview: dataUrl,
      };
    },
    [],
  );

  const handleFileSelect = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      callback: (file: File) => Promise<void>,
    ) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await callback(file);
      }
      target.value = '';
    },
    [],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent, callback: (file: File) => Promise<void>) => {
      event.preventDefault();
      setIsDragOver(false);
      const files = event.dataTransfer.files;
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await callback(file);
      }
    },
    [],
  );

  const handlePaste = useCallback(
    async (
      event: React.ClipboardEvent,
      callback: (file: File) => Promise<void>,
    ) => {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) await callback(file);
        }
      }
    },
    [],
  );

  return {
    fileInputRef,
    isDragOver,
    triggerFileUpload,
    processFile,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
  };
}
