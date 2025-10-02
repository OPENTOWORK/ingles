// Performance Optimization Utilities
export class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = new Set();
    this.lazyLoadObserver = null;
    this.performanceMetrics = {
      pageLoadTimes: [],
      componentRenderTimes: {},
      apiCallTimes: {},
      cacheHitRates: {}
    };
  }

  // Initialize performance monitoring
  init() {
    this.setupLazyLoading();
    this.setupPerformanceObserver();
    this.preloadCriticalResources();
    this.setupServiceWorker();
  }

  // Lazy loading setup
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            this.loadLazyContent(element);
            this.lazyLoadObserver.unobserve(element);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
    }
  }

  // Load lazy content
  loadLazyContent(element) {
    const src = element.dataset.src;
    const component = element.dataset.component;
    
    if (src) {
      element.src = src;
      element.classList.remove('lazy');
    }
    
    if (component) {
      this.dynamicImport(component).then(module => {
        element.innerHTML = module.default;
      });
    }
  }

  // Dynamic import with caching
  async dynamicImport(moduleName) {
    const cacheKey = `module_${moduleName}`;
    
    if (this.cache.has(cacheKey)) {
      this.recordCacheHit(cacheKey);
      return this.cache.get(cacheKey);
    }

    const startTime = performance.now();
    try {
      const module = await import(`@/components/${moduleName}`);
      const loadTime = performance.now() - startTime;
      
      this.cache.set(cacheKey, module);
      this.recordPerformanceMetric('componentRenderTimes', moduleName, loadTime);
      
      return module;
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error);
      throw error;
    }
  }

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      '/audio/a1/listening/basico/greetings.mp3',
      '/images/vocabulary/cat.jpg',
      '/components/AudioPlayer.js',
      '/components/ProgressDashboard.js'
    ];

    criticalResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  // Preload resource
  preloadResource(url) {
    if (this.preloadQueue.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
      link.as = 'audio';
    } else if (url.endsWith('.jpg') || url.endsWith('.png')) {
      link.as = 'image';
    }

    document.head.appendChild(link);
    this.preloadQueue.add(url);
  }

  // Setup performance observer
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.recordPageLoadTime(entry.loadEventEnd - entry.fetchStart);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.analyzeResourcePerformance(entry);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  // Record page load time
  recordPageLoadTime(loadTime) {
    this.performanceMetrics.pageLoadTimes.push(loadTime);
    
    // Keep only last 10 measurements
    if (this.performanceMetrics.pageLoadTimes.length > 10) {
      this.performanceMetrics.pageLoadTimes.shift();
    }

    // Report slow pages
    if (loadTime > 3000) {
      console.warn(`Slow page load detected: ${loadTime}ms`);
      this.reportPerformanceIssue('slow_page_load', { loadTime });
    }
  }

  // Analyze resource performance
  analyzeResourcePerformance(entry) {
    const resourceTime = entry.responseEnd - entry.requestStart;
    
    if (resourceTime > 1000) {
      console.warn(`Slow resource detected: ${entry.name} took ${resourceTime}ms`);
    }

    // Track API calls
    if (entry.name.includes('/api/')) {
      const apiName = entry.name.split('/').pop();
      this.recordPerformanceMetric('apiCallTimes', apiName, resourceTime);
    }
  }

  // Record performance metric
  recordPerformanceMetric(category, key, value) {
    if (!this.performanceMetrics[category][key]) {
      this.performanceMetrics[category][key] = [];
    }
    
    this.performanceMetrics[category][key].push(value);
    
    // Keep only last 20 measurements
    if (this.performanceMetrics[category][key].length > 20) {
      this.performanceMetrics[category][key].shift();
    }
  }

  // Record cache hit
  recordCacheHit(key) {
    const category = 'cacheHitRates';
    if (!this.performanceMetrics[category][key]) {
      this.performanceMetrics[category][key] = { hits: 0, misses: 0 };
    }
    this.performanceMetrics[category][key].hits++;
  }

  // Record cache miss
  recordCacheMiss(key) {
    const category = 'cacheHitRates';
    if (!this.performanceMetrics[category][key]) {
      this.performanceMetrics[category][key] = { hits: 0, misses: 0 };
    }
    this.performanceMetrics[category][key].misses++;
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      averagePageLoadTime: this.calculateAverage(this.performanceMetrics.pageLoadTimes),
      cacheHitRates: {},
      slowestComponents: [],
      slowestAPIs: []
    };

    // Calculate cache hit rates
    Object.entries(this.performanceMetrics.cacheHitRates).forEach(([key, data]) => {
      const total = data.hits + data.misses;
      summary.cacheHitRates[key] = total > 0 ? (data.hits / total) * 100 : 0;
    });

    // Find slowest components
    Object.entries(this.performanceMetrics.componentRenderTimes).forEach(([key, times]) => {
      const averageTime = this.calculateAverage(times);
      summary.slowestComponents.push({ component: key, averageTime });
    });
    summary.slowestComponents.sort((a, b) => b.averageTime - a.averageTime);

    // Find slowest APIs
    Object.entries(this.performanceMetrics.apiCallTimes).forEach(([key, times]) => {
      const averageTime = this.calculateAverage(times);
      summary.slowestAPIs.push({ api: key, averageTime });
    });
    summary.slowestAPIs.sort((a, b) => b.averageTime - a.averageTime);

    return summary;
  }

  // Calculate average
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // Report performance issue
  reportPerformanceIssue(type, data) {
    // In a real app, this would send data to analytics service
    console.warn(`Performance issue: ${type}`, data);
    
    // Could also send to monitoring service
    // analytics.track('performance_issue', { type, ...data });
  }

  // Setup service worker for caching
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  // Debounce function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function calls
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Optimize images
  optimizeImage(img, options = {}) {
    const {
      quality = 0.8,
      maxWidth = 800,
      maxHeight = 600,
      format = 'webp'
    } = options;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const imgObj = new Image();
      imgObj.onload = () => {
        // Calculate new dimensions
        let { width, height } = imgObj;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(imgObj, 0, 0, width, height);
        
        const optimizedDataUrl = canvas.toDataURL(`image/${format}`, quality);
        resolve(optimizedDataUrl);
      };
      
      imgObj.src = img.src;
    });
  }

  // Bundle splitting for code
  async loadComponentBundle(bundleName) {
    const cacheKey = `bundle_${bundleName}`;
    
    if (this.cache.has(cacheKey)) {
      this.recordCacheHit(cacheKey);
      return this.cache.get(cacheKey);
    }

    const startTime = performance.now();
    try {
      const bundle = await import(`@/bundles/${bundleName}`);
      const loadTime = performance.now() - startTime;
      
      this.cache.set(cacheKey, bundle);
      this.recordPerformanceMetric('componentRenderTimes', bundleName, loadTime);
      
      return bundle;
    } catch (error) {
      console.error(`Failed to load bundle ${bundleName}:`, error);
      throw error;
    }
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };

      // Warn if memory usage is high
      if (usage.used / usage.limit > 0.8) {
        console.warn('High memory usage detected:', usage);
        this.reportPerformanceIssue('high_memory_usage', usage);
      }

      return usage;
    }
    return null;
  }

  // Clean up resources
  cleanup() {
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
    }
    
    // Clear old cache entries
    const maxCacheSize = 100;
    if (this.cache.size > maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      const toDelete = entries.slice(0, entries.length - maxCacheSize);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const summary = this.getPerformanceSummary();
    const recommendations = [];

    // Page load time recommendations
    if (summary.averagePageLoadTime > 2000) {
      recommendations.push({
        type: 'page_load',
        priority: 'high',
        message: 'Page load time is slow',
        suggestion: 'Consider code splitting and lazy loading'
      });
    }

    // Cache hit rate recommendations
    Object.entries(summary.cacheHitRates).forEach(([key, rate]) => {
      if (rate < 50) {
        recommendations.push({
          type: 'caching',
          priority: 'medium',
          message: `Low cache hit rate for ${key}`,
          suggestion: 'Improve caching strategy'
        });
      }
    });

    // Component performance recommendations
    summary.slowestComponents.slice(0, 3).forEach(({ component, averageTime }) => {
      if (averageTime > 100) {
        recommendations.push({
          type: 'component',
          priority: 'medium',
          message: `Slow component: ${component}`,
          suggestion: 'Optimize rendering or split into smaller components'
        });
      }
    });

    return recommendations;
  }
}

// Create singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    performanceOptimizer.recordPerformanceMetric('componentRenderTimes', componentName, renderTime);
    
    return () => {
      // Cleanup if needed
    };
  }, [componentName, startTime]);
};

// Higher-order component for lazy loading
export const withLazyLoading = (Component, loadingComponent = null) => {
  return function LazyLoadedComponent(props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (isVisible && !isLoaded) {
        // Simulate loading time
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
      }
    }, [isVisible, isLoaded]);

    return (
      <div ref={elementRef}>
        {isLoaded ? (
          <Component {...props} />
        ) : (
          loadingComponent || <div>Loading...</div>
        )}
      </div>
    );
  };
};






















