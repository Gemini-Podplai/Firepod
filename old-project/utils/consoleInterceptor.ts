export interface LogEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: Date;
}

export type LogListener = (entry: LogEntry) => void;

class ConsoleInterceptor {
  private listeners: LogListener[] = [];
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };

  constructor() {
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
  }

  addListener(listener: LogListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  setupInterceptor(context?: Window): void {
    const targetConsole = context?.console || console;
    
    targetConsole.log = (...args: any[]) => {
      this.notifyListeners('log', args);
      this.originalConsole.log.apply(console, args);
    };

    targetConsole.error = (...args: any[]) => {
      this.notifyListeners('error', args);
      this.originalConsole.error.apply(console, args);
    };

    targetConsole.warn = (...args: any[]) => {
      this.notifyListeners('warn', args);
      this.originalConsole.warn.apply(console, args);
    };

    targetConsole.info = (...args: any[]) => {
      this.notifyListeners('info', args);
      this.originalConsole.info.apply(console, args);
    };
  }

  resetInterceptor(context?: Window): void {
    const targetConsole = context?.console || console;
    
    targetConsole.log = this.originalConsole.log;
    targetConsole.error = this.originalConsole.error;
    targetConsole.warn = this.originalConsole.warn;
    targetConsole.info = this.originalConsole.info;
  }

  private notifyListeners(type: 'log' | 'error' | 'warn' | 'info', args: any[]): void {
    const content = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const entry: LogEntry = {
      type,
      content,
      timestamp: new Date()
    };

    this.listeners.forEach(listener => listener(entry));
  }
}

// Singleton instance
export const consoleInterceptor = new ConsoleInterceptor();
