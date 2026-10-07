import path from 'path';
import fs from 'fs';
import { execute, getStoragePaths } from '../db';

function getUploadsDir(): string {
  const { uploadsDir } = getStoragePaths();
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch {}
  }
  return uploadsDir;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.pptx', '.xlsx', '.png', '.jpg', '.jpeg', '.zip', '.mp4', '.yml', '.yaml', '.txt'
]);

export interface SavedFileResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export async function saveUploadedFile(
  file: File,
  userId: string,
  taskId: string
): Promise<SavedFileResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 50MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`File extension "${ext}" is not supported. Allowed formats: PDF, DOCX, PPTX, XLSX, PNG, JPG, ZIP, MP4`);
  }

  const uploadsDir = getUploadsDir();

  // Generate safe filename and unique ID
  const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedFilename = `${fileId}_${sanitizedOriginal}`;
  const filePath = path.join(uploadsDir, storedFilename);

  // Write file buffer to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const fileUrl = `/api/files/${storedFilename}`;

  return {
    fileId,
    fileName: file.name,
    fileUrl,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size
  };
}

export function getFilePath(storedFilename: string): string | null {
  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, storedFilename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return filePath;
}
