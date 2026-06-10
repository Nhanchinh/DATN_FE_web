/**
 * Parse an API datetime safely.
 * MongoDB-backed legacy responses may omit timezone even though the value is UTC.
 * @param {Date|string} date - Date object or date string
 * @returns {Date} Parsed Date object
 */
export const parseApiDate = (date) => {
    if (date instanceof Date) return date;

    const value = String(date);
    const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
    return new Date(hasTimezone ? value : `${value}Z`);
};

/**
 * Format date to locale string
 * @param {Date|string} date - Date object or date string
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'vi-VN') => {
    const dateObj = parseApiDate(date);
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

/**
 * Format date and time
 * @param {Date|string} date - Date object or date string
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, locale = 'vi-VN') => {
    const dateObj = parseApiDate(date);
    return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Object with isValid boolean and message
 */
export const validatePassword = (password) => {
    if (password.length < 8) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
    }
    return { isValid: true, message: 'Mật khẩu hợp lệ' };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};
