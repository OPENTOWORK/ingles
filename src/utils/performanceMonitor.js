// Production Performance Monitoring System
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageViews: [],
      userInteractions: [],
      apiCalls: [],
      errors: [],
      performance: []
    };
    this.config = {
      apiEndpoint: '/api/analytics',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableTracking: process.env.NODE_ENV === 'production'
    };
    this.buffer = [];
    this.isFlushing = false;
  }

  // Initialize monitoring
  init() {
    if (!this.config.enableTracking) return;

    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupUserInteractionTracking();
    this.startFlushTimer();
    
    console.log('Performance monitoring initialized');
  }

  // Track page view
  trackPageView(page, metadata = {}) {
    if (!this.config.enableTracking) return;

    const pageView = {
      type: 'page_view',
      page,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      ...metadata
    };

    this.buffer.push(pageView);
    this.metrics.pageViews.push(pageView);
    this.flushIfNeeded();
  }

  // Track user interaction
  trackInteraction(type, element, metadata = {}) {
    if (!this.config.enableTracking) return;

    const interaction = {
      type: 'user_interaction',
      interactionType: type,
      element: this.getElementInfo(element),
      timestamp: Date.now(),
      ...metadata
    };

    this.buffer.push(interaction);
    this.metrics.userInteractions.push(interaction);
    this.flushIfNeeded();
  }

  // Track API call
  trackApiCall(url, method, duration, status, metadata = {}) {
    if (!this.config.enableTracking) return;

    const apiCall = {
      type: 'api_call',
      url,
      method,
      duration,
      status,
      timestamp: Date.now(),
      ...metadata
    };

    this.buffer.push(apiCall);
    this.metrics.apiCalls.push(apiCall);
    this.flushIfNeeded();
  }

  // Track error
  trackError(error, context = {}) {
    if (!this.config.enableTracking) return;

    const errorData = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    this.buffer.push(errorData);
    this.metrics.errors.push(errorData);
    this.flushIfNeeded();
  }

  // Track performance metric
  trackPerformance(name, value, metadata = {}) {
    if (!this.config.enableTracking) return;

    const performanceData = {
      type: 'performance',
      name,
      value,
      timestamp: Date.now(),
      ...metadata
    };

    this.buffer.push(performanceData);
    this.metrics.performance.push(performanceData);
    this.flushIfNeeded();
  }

  // Setup Performance Observer
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          this.trackPerformance('page_load_time', entry.loadEventEnd - entry.fetchStart, {
            navigationType: entry.type,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
            firstPaint: entry.loadEventStart - entry.fetchStart
          });
        }
      });
    });
    navObserver.observe({ entryTypes: ['navigation'] });

    // Observe resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.duration > 1000) { // Track slow resources
          this.trackPerformance('slow_resource', entry.duration, {
            name: entry.name,
            type: entry.initiatorType,
            size: entry.transferSize
          });
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });

    // Observe largest contentful paint
    const lcpObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.trackPerformance('largest_contentful_paint', entry.startTime);
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe first input delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.trackPerformance('first_input_delay', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe cumulative layout shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      if (clsValue > 0) {
        this.trackPerformance('cumulative_layout_shift', clsValue);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  // Setup error tracking
  setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });
    });

    // Resource error handler
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError(new Error(`Resource load error: ${event.target.src || event.target.href}`), {
          type: 'resource_error',
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }

  // Setup user interaction tracking
  setupUserInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', event.target, {
        x: event.clientX,
        y: event.clientY
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.trackInteraction('form_submit', event.target);
    });

    // Track scroll events (throttled)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction('scroll', document.body, {
          scrollY: window.scrollY,
          scrollX: window.scrollX
        });
      }, 1000);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackInteraction('visibility_change', document, {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });
  }

  // Get element information
  getElementInfo(element) {
    if (!element) return null;

    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 100),
      attributes: {
        'data-testid': element.getAttribute('data-testid'),
        'aria-label': element.getAttribute('aria-label'),
        role: element.getAttribute('role')
      }
    };
  }

  // Start flush timer
  startFlushTimer() {
    setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Flush if buffer is full
  flushIfNeeded() {
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Flush data to server
  async flush() {
    if (this.isFlushing || this.buffer.length === 0) return;

    this.isFlushing = true;
    const dataToFlush = [...this.buffer];
    this.buffer = [];

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: dataToFlush,
          sessionId: this.getSessionId(),
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      console.log(`Flushed ${dataToFlush.length} analytics events`);
    } catch (error) {
      console.error('Failed to flush analytics data:', error);
      // Put data back in buffer for retry
      this.buffer.unshift(...dataToFlush);
    } finally {
      this.isFlushing = false;
    }
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Get metrics summary
  getMetricsSummary() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);

    return {
      totalEvents: this.buffer.length + Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0),
      pageViews: this.metrics.pageViews.length,
      userInteractions: this.metrics.userInteractions.length,
      apiCalls: this.metrics.apiCalls.length,
      errors: this.metrics.errors.length,
      performanceMetrics: this.metrics.performance.length,
      recentErrors: this.metrics.errors.filter(e => e.timestamp > lastHour),
      averagePageLoadTime: this.calculateAverage(this.metrics.performance.filter(p => p.name === 'page_load_time').map(p => p.value)),
      errorRate: this.calculateErrorRate()
    };
  }

  // Calculate average
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // Calculate error rate
  calculateErrorRate() {
    const totalEvents = this.metrics.pageViews.length + this.metrics.userInteractions.length + this.metrics.apiCalls.length;
    return totalEvents > 0 ? (this.metrics.errors.length / totalEvents) * 100 : 0;
  }

  // Create performance dashboard data
  getDashboardData() {
    const summary = this.getMetricsSummary();
    const performanceMetrics = this.metrics.performance.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {});

    return {
      summary,
      performanceMetrics: Object.entries(performanceMetrics).map(([name, values]) => ({
        name,
        average: this.calculateAverage(values),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      })),
      recentActivity: this.buffer.slice(-10),
      topErrors: this.getTopErrors(),
      userFlow: this.analyzeUserFlow()
    };
  }

  // Get top errors
  getTopErrors() {
    const errorCounts = {};
    this.metrics.errors.forEach(error => {
      const key = error.message || 'Unknown error';
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Analyze user flow
  analyzeUserFlow() {
    const pageSequence = this.metrics.pageViews.map(pv => pv.page);
    const flows = {};
    
    for (let i = 0; i < pageSequence.length - 1; i++) {
      const current = pageSequence[i];
      const next = pageSequence[i + 1];
      const key = `${current} -> ${next}`;
      flows[key] = (flows[key] || 0) + 1;
    }

    return Object.entries(flows)
      .map(([flow, count]) => ({ flow, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Export metrics for debugging
  exportMetrics() {
    return {
      metrics: this.metrics,
      buffer: this.buffer,
      config: this.config,
      summary: this.getMetricsSummary()
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = {
      pageViews: [],
      userInteractions: [],
      apiCalls: [],
      errors: [],
      performance: []
    };
    this.buffer = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performanceMonitor.trackPerformance('component_render_time', renderTime, {
        component: componentName
      });
    };
  }, [componentName]);
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    usePerformanceMonitoring(componentName);
    
    return <WrappedComponent {...props} />;
  };
};

// Helper functions
export const trackPageView = (page, metadata = {}) => {
  performanceMonitor.trackPageView(page, metadata);
};

export const trackInteraction = (type, element, metadata = {}) => {
  performanceMonitor.trackInteraction(type, element, metadata);
};

export const trackApiCall = (url, method, duration, status, metadata = {}) => {
  performanceMonitor.trackApiCall(url, method, duration, status, metadata);
};

export const trackError = (error, context = {}) => {
  performanceMonitor.trackError(error, context);
};

export const trackPerformance = (name, value, metadata = {}) => {
  performanceMonitor.trackPerformance(name, value, metadata);
};

// Initialize monitoring when module loads
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}



