/**
 * Data Exporter Class
 * Handles bundling application data and downloading as JSON
 */
class Exporter {
  constructor() {
    this.data = {};
  }

  /**
   * Add data to the export bundle
   * @param {string} key - The key to store data under
   * @param {*} value - The data to store
   */
  addData(key, value) {
    this.data[key] = value;
  }

  /**
   * Bundle multiple data objects
   * @param {Object} dataObject - Object containing key-value pairs to add
   */
  bundleData(dataObject) {
    Object.assign(this.data, dataObject);
  }

  /**
   * Clear all bundled data
   */
  clearData() {
    this.data = {};
  }

  /**
   * Get the current bundled data
   * @returns {Object} The current data bundle
   */
  getData() {
    return { ...this.data };
  }

  /**
   * Export data as JSON and trigger download
   * @param {string} filename - The name of the file to download (default: 'export.json')
   * @param {boolean} pretty - Whether to format JSON with indentation (default: true)
   */
  downloadJSON(filename = 'export.json', pretty = true) {
    try {
      // Create JSON string
      const jsonString = pretty 
        ? JSON.stringify(this.data, null, 2)
        : JSON.stringify(this.data);

      // Create blob with JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create temporary anchor element for download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error downloading JSON:', error);
      return false;
    }
  }

  /**
   * Export specific data subset as JSON
   * @param {string[]} keys - Array of keys to include in export
   * @param {string} filename - The name of the file to download
   * @param {boolean} pretty - Whether to format JSON with indentation
   */
  downloadSubset(keys, filename = 'export-subset.json', pretty = true) {
    const subset = {};
    keys.forEach(key => {
      if (this.data.hasOwnProperty(key)) {
        subset[key] = this.data[key];
      }
    });
    
    const originalData = this.data;
    this.data = subset;
    const result = this.downloadJSON(filename, pretty);
    this.data = originalData;
    
    return result;
  }

  /**
   * Add metadata to export (timestamp, version, etc.)
   */
  addMetadata() {
    this.data._metadata = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      userAgent: navigator.userAgent
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Exporter;
} else if (typeof window !== 'undefined') {
  window.Exporter = Exporter;
}
