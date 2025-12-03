import { Injectable } from '@angular/core';

export interface SaveOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: {
      [mimeType: string]: string[];
    };
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}

  async saveFile(blob: Blob, options: SaveOptions = {}): Promise<FileSystemFileHandle | null> {
    try {
      // Check if the File System Access API is supported
      if (!('showSaveFilePicker' in window)) {
        throw new Error('File System Access API not supported');
      }

      const defaultTypes = [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] },
      }];

      const fileOptions = {
        suggestedName: options.suggestedName || 'flowchart.json',
        types: options.types || defaultTypes,
      };

      const fileHandle = await (window as any).showSaveFilePicker(fileOptions);
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      return fileHandle;
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error saving file:', error);
        throw error;
      }
      return null;
    }
  }

  async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }
}
