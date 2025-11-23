/**
 * Utility Functions
 * Helper functions for the application
 */

class Utils {
    /**
     * Debounce function calls
     */
    static debounce(func, wait) {
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

    /**
     * Throttle function calls
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (obj instanceof Set) return new Set(Array.from(obj).map(item => Utils.deepClone(item)));
        if (obj instanceof Map) {
            return new Map(Array.from(obj.entries()).map(([key, val]) => [key, Utils.deepClone(val)]));
        }

        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = Utils.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Download file
     */
    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Read file from input
     */
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Get contrasting text color
     */
    static getContrastColor(hexColor) {
        const rgb = parseInt(hexColor.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma > 128 ? '#000000' : '#FFFFFF';
    }

    /**
     * Detect mobile device
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Detect touch support
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Copy to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }

    /**
     * Show toast notification
     */
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    }

    /**
     * Local storage with error handling
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('localStorage error:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('localStorage error:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('localStorage error:', e);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.warn('localStorage error:', e);
                return false;
            }
        }
    };

    /**
     * Performance monitoring
     */
    static performance = {
        marks: new Map(),

        mark(name) {
            this.marks.set(name, performance.now());
        },

        measure(startMark, endMark = null) {
            const start = this.marks.get(startMark);
            const end = endMark ? this.marks.get(endMark) : performance.now();
            return end - start;
        },

        clear() {
            this.marks.clear();
        }
    };
}

/**
 * State Manager with Undo/Redo
 */
class StateManager {
    constructor(maxHistory = 50) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Save current state
     */
    saveState(state) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        this.history.push(Utils.deepClone(state));

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    /**
     * Undo to previous state
     */
    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return Utils.deepClone(this.history[this.currentIndex]);
        }
        return null;
    }

    /**
     * Redo to next state
     */
    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return Utils.deepClone(this.history[this.currentIndex]);
        }
        return null;
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Clear history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Get current state
     */
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return Utils.deepClone(this.history[this.currentIndex]);
        }
        return null;
    }
}

/**
 * Theme Manager
 */
class ThemeManager {
    constructor() {
        this.currentTheme = Utils.storage.get('theme', 'light');
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    background: '#ffffff',
                    surface: '#f5f5f5',
                    primary: '#667eea',
                    secondary: '#764ba2',
                    text: '#333333',
                    textSecondary: '#666666',
                    border: '#e0e0e0',
                    success: '#4CAF50',
                    error: '#f44336',
                    warning: '#ff9800',
                    info: '#2196F3'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    background: '#1a1a1a',
                    surface: '#2d2d2d',
                    primary: '#8b5cf6',
                    secondary: '#ec4899',
                    text: '#f5f5f5',
                    textSecondary: '#b0b0b0',
                    border: '#404040',
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                    info: '#3b82f6'
                }
            },
            ocean: {
                name: 'Ocean',
                colors: {
                    background: '#0a192f',
                    surface: '#112240',
                    primary: '#64ffda',
                    secondary: '#5eead4',
                    text: '#e6f1ff',
                    textSecondary: '#8892b0',
                    border: '#233554',
                    success: '#10b981',
                    error: '#f87171',
                    warning: '#fbbf24',
                    info: '#38bdf8'
                }
            }
        };
    }

    /**
     * Apply theme
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;
        Utils.storage.set('theme', themeName);

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        document.body.setAttribute('data-theme', themeName);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get available themes
     */
    getThemes() {
        return Object.keys(this.themes);
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const themes = this.getThemes();
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
        return themes[nextIndex];
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
