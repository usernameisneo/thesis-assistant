/**
 * Ingest Module - Handles URL and PDF ingestion using Web Workers
 * Provides interface for thesis assistant app to process user-uploaded sources
 */

class Ingest {
  constructor() {
    this.worker = null;
    this.isWorkerReady = false;
    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null
    };
    
    this.initializeWorker();
  }

  /**
   * Initialize the web worker for offloading parsing tasks
   */
  initializeWorker() {
    try {
      // Create worker from the ingestWorker.js file
      this.worker = new Worker('/assets/workers/ingestWorker.js');
      
      // Set up message handling
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.triggerCallback('onError', {
          type: 'worker_error',
          message: 'Web worker initialization failed',
          error: error
        });
      };
      
      // Send initialization message
      this.worker.postMessage({ type: 'init' });
      
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.triggerCallback('onError', {
        type: 'worker_init_error',
        message: 'Could not load web worker',
        error: error
      });
    }
  }

  /**
   * Handle messages from the web worker
   */
  handleWorkerMessage(data) {
    const { type, payload, error } = data;
    
    switch (type) {
      case 'worker_ready':
        this.isWorkerReady = true;
        console.log('Ingest worker ready');
        break;
        
      case 'progress':
        this.triggerCallback('onProgress', payload);
        break;
        
      case 'ingest_complete':
        this.triggerCallback('onComplete', payload);
        break;
        
      case 'error':
        this.triggerCallback('onError', payload);
        break;
        
      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  /**
   * Set event callbacks for progress, completion, and error handling
   */
  setCallbacks({ onProgress, onComplete, onError }) {
    if (onProgress) this.callbacks.onProgress = onProgress;
    if (onComplete) this.callbacks.onComplete = onComplete;
    if (onError) this.callbacks.onError = onError;
  }

  /**
   * Trigger a callback if it exists
   */
  triggerCallback(callbackName, data) {
    if (this.callbacks[callbackName]) {
      this.callbacks[callbackName](data);
    }
  }

  /**
   * Ingest a URL by sending it to the worker for processing
   * @param {string} url - The URL to ingest
   * @returns {Promise} Promise that resolves when ingestion starts
   */
  async ingestURL(url) {
    if (!this.isWorkerReady) {
      throw new Error('Worker not ready. Please wait for initialization.');
    }
    
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }
    
    // Send URL to worker for processing
    this.worker.postMessage({
      type: 'ingest_url',
      payload: {
        url: url,
        timestamp: Date.now()
      }
    });
    
    // Return promise that resolves when processing starts
    return Promise.resolve({
      status: 'processing',
      url: url
    });
  }

  /**
   * Ingest a PDF file by sending it to the worker for processing
   * @param {File} file - The PDF file to ingest
   * @returns {Promise} Promise that resolves when ingestion starts
   */
  async ingestPDF(file) {
    if (!this.isWorkerReady) {
      throw new Error('Worker not ready. Please wait for initialization.');
    }
    
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }
    
    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF');
    }
    
    // Convert file to ArrayBuffer for worker
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Send file data to worker for processing
      this.worker.postMessage({
        type: 'ingest_pdf',
        payload: {
          fileName: file.name,
          fileSize: file.size,
          fileData: arrayBuffer,
          timestamp: Date.now()
        }
      }, [arrayBuffer]); // Transfer ownership of ArrayBuffer
      
      return Promise.resolve({
        status: 'processing',
        fileName: file.name,
        fileSize: file.size
      });
      
    } catch (error) {
      throw new Error(`Failed to read PDF file: ${error.message}`);
    }
  }

  /**
   * Get the current status of the ingest worker
   */
  getStatus() {
    return {
      workerReady: this.isWorkerReady,
      hasCallbacks: {
        onProgress: !!this.callbacks.onProgress,
        onComplete: !!this.callbacks.onComplete,
        onError: !!this.callbacks.onError
      }
    };
  }

  /**
   * Terminate the worker and clean up resources
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isWorkerReady = false;
    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null
    };
  }
}

// Export for use in the thesis assistant app
export default Ingest;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.Ingest = Ingest;
}
