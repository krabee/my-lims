/**
 * File storage service
 * Handles saving, retrieving, and deleting uploaded files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

export interface SavedFile {
  fileName: string;
  filePath: string;
  fileSize: number;
}

/**
 * Save a file buffer to the uploads directory
 * @param buffer - File content as Buffer
 * @param originalFileName - Original file name
 * @returns File metadata including path and size
 */
export async function saveFile(
  buffer: Buffer,
  originalFileName: string
): Promise<SavedFile> {
  // Create uploads directory if it doesn't exist
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Generate unique filename to avoid conflicts
  const ext = path.extname(originalFileName);
  const uniqueFileName = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFileName);

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  return {
    fileName: uniqueFileName,
    filePath: filePath,
    fileSize: buffer.length,
  };
}

/**
 * Get absolute file path for a given filename
 * @param fileName - File name in uploads directory
 * @returns Absolute file path
 */
export function getFilePath(fileName: string): string {
  return path.resolve(UPLOAD_DIR, fileName);
}

/**
 * Delete a file from the uploads directory
 * @param fileName - File name to delete
 */
export async function deleteFile(fileName: string): Promise<void> {
  const filePath = getFilePath(fileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

/**
 * Read file from uploads directory
 * @param fileName - File name to read
 * @returns File buffer
 */
export async function readFile(fileName: string): Promise<Buffer> {
  const filePath = getFilePath(fileName);
  return await fs.readFile(filePath);
}
