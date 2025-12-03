import { TestBed } from '@angular/core/testing';
import { FileService } from './file.service';

// Extend the Window interface for testing
declare global {
  interface Window {
    showSaveFilePicker?: (options?: any) => Promise<any>;
  }
}

describe('FileService', () => {
  let service: FileService;
  let mockFileHandle: FileSystemFileHandle;
  let mockWritable: FileSystemWritableFileStream;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
    service = TestBed.inject(FileService);
    
    // Mock the File System Access API
    mockWritable = {
      write: jasmine.createSpy('write').and.returnValue(Promise.resolve()),
      close: jasmine.createSpy('close').and.returnValue(Promise.resolve())
    } as unknown as FileSystemWritableFileStream;
    
    mockFileHandle = {
      kind: 'file',
      name: 'test.json',
      createWritable: jasmine.createSpy('createWritable').and.returnValue(Promise.resolve(mockWritable))
    } as unknown as FileSystemFileHandle;
    
    // Mock the showSaveFilePicker function
    (window as any).showSaveFilePicker = jasmine.createSpy('showSaveFilePicker')
      .and.returnValue(Promise.resolve(mockFileHandle));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveFile', () => {
    it('should save file with default options', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      await service.saveFile(blob);
      
      expect((window as any).showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'flowchart.json',
        types: [{
          description: 'JSON File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      
      expect(mockFileHandle.createWritable).toHaveBeenCalled();
      expect(mockWritable.write).toHaveBeenCalledWith(blob);
      expect(mockWritable.close).toHaveBeenCalled();
    });

    it('should save file with custom options', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      const options = {
        suggestedName: 'custom.json',
        types: [{
          description: 'Custom Type',
          accept: { 'text/plain': ['.txt'] },
        }],
      };
      
      await service.saveFile(blob, options);
      
      expect((window as any).showSaveFilePicker).toHaveBeenCalledWith(options);
    });
  });

  it('should read file content', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const content = await service.readFile(file);
    expect(content).toBe('test content');
  });
  
  it('should handle file save cancellation', async () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const error = new Error('The user aborted a request.');
    (error as any).name = 'AbortError';
    
    // Mock the showSaveFilePicker to simulate user cancellation
    (window as any).showSaveFilePicker.and.returnValue(Promise.reject(error));
    
    const result = await service.saveFile(blob);
    expect(result).toBeNull();
  });
});
