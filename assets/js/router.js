// Thesis Assistant - Router

/**
 * Simple client-side router for the thesis assistant application
 */
export const router = {
  routes: new Map(),
  currentRoute: null,

  /**
   * Add a route to the router
   * @param {string} path - Route path
   * @param {Function} handler - Route handler function
   */
  addRoute: (path, handler) => {
    router.routes.set(path, handler);
  },

  /**
   * Navigate to a specific route
   * @param {string} path - Path to navigate to
   */
  navigate: (path) => {
    const handler = router.routes.get(path);
    if (handler) {
      router.currentRoute = path;
      handler();
      window.history.pushState({}, '', path);
    } else {
      console.warn(`Route not found: ${path}`);
    }
  },

  /**
   * Initialize the router
   */
  init: () => {
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      const handler = router.routes.get(path);
      if (handler) {
        router.currentRoute = path;
        handler();
      }
    });

    // Handle initial route
    const initialPath = window.location.pathname || '/';
    router.navigate(initialPath);
  }
};
