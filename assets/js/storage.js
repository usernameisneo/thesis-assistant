// Thesis Assistant - Storage Management

/**
 * Storage management for thesis assistant application
 * Handles localStorage, sessionStorage, and IndexedDB operations
 */
export const storage = {
  /**
   * Local storage operations
   */
  local: {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    save: (key, data) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
      }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Stored data or null
     */
    load: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
      }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove: (key) => {
      localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage data
     */
    clear: () => {
      localStorage.clear();
    }
  },

  /**
   * Session storage operations
   */
  session: {
    /**
     * Save data to sessionStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    save: (key, data) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error saving to sessionStorage:', error);
        return false;
      }
    },

    /**
     * Load data from sessionStorage
     * @param {string} key - Storage key
     * @returns {any} Stored data or null
     */
    load: (key) => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error loading from sessionStorage:', error);
        return null;
      }
    },

    /**
     * Remove data from sessionStorage
     * @param {string} key - Storage key
     */
    remove: (key) => {
      sessionStorage.removeItem(key);
    },

    /**
     * Clear all sessionStorage data
     */
    clear: () => {
      sessionStorage.clear();
    }
  }
};
