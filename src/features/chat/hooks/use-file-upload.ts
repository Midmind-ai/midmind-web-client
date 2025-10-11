import { useRef, useState } from 'react';
import { SUPPORTED_FORMATS, type SupportedFileFormat } from '@constants/files';
import type { AttachmentProgress } from '@features/chat/types/chat-types';
import { useModalOperations } from '@hooks/logic/use-modal-operations';
import { FilesService } from '@services/files/files-service';

/**
 * Custom hook to handle file upload logic for chat input
 * Manages file attachments, upload progress, and file operations
 */
export const useFileUpload = () => {
  const [attachments, setAttachments] = useState<AttachmentProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openModal } = useModalOperations();

  /**
   * Handle file upload with progress tracking
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newAttachments: AttachmentProgress[] = Array.from(files).map(file => ({
      id: '',
      progress: 0,
      file,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);

    const updateAttachment = (
      index: number,
      updater: (prev: AttachmentProgress) => AttachmentProgress
    ) => {
      setAttachments(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = updater(updated[index]);
        }

        return updated;
      });
    };

    await Promise.all(
      newAttachments.map(async (attachment, index) => {
        const actualIndex = attachments.length + index;

        updateAttachment(actualIndex, prev => ({ ...prev, progress: 0 }));

        const initResponse = await FilesService.initFileUpload(
          {
            mime_type: attachment.file.type as SupportedFileFormat,
            original_filename: attachment.file.name,
            size_bytes: attachment.file.size,
            extension: attachment.file.name.split('.').pop() || '',
          },
          progressEvent => {
            const currentProgress = Math.round(
              (progressEvent.loaded / (progressEvent?.total ?? 0)) * 100
            );
            updateAttachment(actualIndex, prev => ({
              ...prev,
              progress: currentProgress,
            }));
          }
        );

        updateAttachment(actualIndex, prev => ({ ...prev, id: initResponse.file_id }));

        await fetch(initResponse.upload_url, {
          method: 'POST',
          body: attachment.file,
        });

        await FilesService.finalizeFileUpload(initResponse.file_id, {
          actual_size_bytes: attachment.file.size,
          status: 'uploaded',
        });
      })
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove attachment by index
   */
  const handleFileRemove = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle pasted images from clipboard
   */
  const handleFilePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;

    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();

        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();

      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));

      handleFileUpload(dataTransfer.files);
    }
  };

  /**
   * Trigger file input click
   */
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Open file preview modal
   */
  const handleFileClick = (file: File) => {
    openModal('FileViewModal', {
      fileUrl: URL.createObjectURL(file),
    });
  };

  return {
    attachments,
    setAttachments,
    fileInputRef,
    handleFileUpload,
    handleFileRemove,
    handleFilePaste,
    handleFileButtonClick,
    handleFileClick,
    supportedFormats: SUPPORTED_FORMATS,
  };
};
