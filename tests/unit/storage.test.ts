/**
 * Unit tests for file storage service
 * TDD: These tests should FAIL before implementation
 */

import { saveFile, getFilePath, deleteFile } from '@/src/lib/storage';

// Mock fs/promises
const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
const mockUnlink = jest.fn();
const mockReadFile = jest.fn();

jest.mock('fs/promises', () => ({
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
  readFile: (...args: unknown[]) => mockReadFile(...args),
}));

describe('File Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveFile', () => {
    it('should save file to uploads directory', async () => {
      const mockBuffer = Buffer.from('test file content');
      const mockFileName = 'test-file.pdf';

      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await saveFile(mockBuffer, mockFileName);

      expect(result).toEqual(
        expect.objectContaining({
          fileName: expect.any(String),
          filePath: expect.any(String),
          fileSize: mockBuffer.length,
        })
      );

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        mockBuffer
      );
    });

    it('should generate unique file names to avoid conflicts', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockFileName = 'duplicate.pdf';

      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result1 = await saveFile(mockBuffer, mockFileName);
      const result2 = await saveFile(mockBuffer, mockFileName);

      expect(result1.fileName).not.toBe(result2.fileName);
    });

    it('should create uploads directory if it does not exist', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockFileName = 'test.pdf';

      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await saveFile(mockBuffer, mockFileName);

      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads'),
        { recursive: true }
      );
    });

    it('should handle file write errors', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockFileName = 'test.pdf';

      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValue(new Error('Write failed'));

      await expect(saveFile(mockBuffer, mockFileName)).rejects.toThrow(
        'Write failed'
      );
    });
  });

  describe('getFilePath', () => {
    it('should return absolute file path', () => {
      const fileName = 'test-file.pdf';

      const result = getFilePath(fileName);

      expect(result).toContain('uploads');
      expect(result).toContain(fileName);
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('should delete file from uploads directory', async () => {
      const fileName = 'test-file.pdf';

      mockUnlink.mockResolvedValue(undefined);

      await deleteFile(fileName);

      expect(mockUnlink).toHaveBeenCalledWith(
        expect.stringContaining(fileName)
      );
    });

    it('should handle file not found errors gracefully', async () => {
      const fileName = 'nonexistent.pdf';

      const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockUnlink.mockRejectedValue(error);

      // Should not throw for missing files
      await expect(deleteFile(fileName)).resolves.not.toThrow();
    });

    it('should throw for other file system errors', async () => {
      const fileName = 'test.pdf';

      mockUnlink.mockRejectedValue(new Error('Permission denied'));

      await expect(deleteFile(fileName)).rejects.toThrow('Permission denied');
    });
  });
});
