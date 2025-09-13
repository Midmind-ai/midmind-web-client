import { memo } from 'react';
import type { GetFileResponseDto } from '@services/files/files-dtos';
import type { components } from 'generated/api-types';

type AttachmentDto = components['schemas']['AppMessageAttachmentDto'];

type Props = {
  attachments: AttachmentDto[];
  fileData: GetFileResponseDto[];
  className?: string;
};

const MessageAttachments = ({ attachments, fileData, className = '' }: Props) => {
  if (attachments.length === 0) {
    return null;
  }

  // Create a map of file data by ID for quick lookup
  const fileDataMap = new Map(fileData.map(file => [file.id, file]));

  const getFileUrl = (attachmentId: string) => {
    const fileData = fileDataMap.get(attachmentId);

    return fileData?.download_url || '';
  };

  const getFileData = (attachmentId: string) => {
    return fileDataMap.get(attachmentId);
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {attachments.map(attachment => {
        const fileUrl = getFileUrl(attachment.id);
        const fileData = getFileData(attachment.id);

        if (!fileUrl || !fileData) {
          return (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-lg border border-dashed
                border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            >
              <span>📎</span>
              <span className="truncate">{attachment.original_filename}</span>
              <span className="text-xs text-gray-400">(Loading...)</span>
            </div>
          );
        }

        if (isImage(attachment.mime_type)) {
          return (
            <div
              key={attachment.id}
              className="group relative"
            >
              <img
                src={fileUrl}
                alt={attachment.original_filename}
                className="max-h-48 max-w-48 cursor-pointer rounded-lg object-cover
                  shadow-sm transition-shadow hover:shadow-md"
                onClick={() => window.open(fileUrl, '_blank')}
                onError={e => {
                  // Fallback to file icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        <span>🖼️</span>
                        <span class="truncate">${attachment.original_filename}</span>
                      </div>
                    `;
                  }
                }}
              />
              <div
                className="bg-opacity-0 group-hover:bg-opacity-10 absolute inset-0 flex
                  items-center justify-center rounded-lg bg-black transition-all
                  duration-200"
              >
                <span
                  className="bg-opacity-50 rounded bg-black px-2 py-1 text-xs font-medium
                    text-white opacity-0 group-hover:opacity-100"
                >
                  {attachment.original_filename}
                </span>
              </div>
            </div>
          );
        }

        // For non-image files, show a file icon with name
        return (
          <a
            key={attachment.id}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-gray-200
              bg-gray-50 px-3 py-2 text-sm text-gray-600 transition-colors
              hover:border-gray-300 hover:bg-gray-100"
          >
            <span>📄</span>
            <span className="max-w-32 truncate">{attachment.original_filename}</span>
          </a>
        );
      })}
    </div>
  );
};

export default memo(MessageAttachments);
