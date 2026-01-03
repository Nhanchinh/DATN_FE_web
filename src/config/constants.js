// Cấu hình constants cho ứng dụng
export const APP_CONFIG = {
    // API
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    API_TIMEOUT: 30000, // 30 seconds

    // App Info
    APP_NAME: import.meta.env.VITE_APP_NAME || 'My React App',

    // Pagination
    DEFAULT_PAGE_SIZE: 10,

    // Local Storage Keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_INFO: 'user_info',
    },

    // Routes
    ROUTES: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        DASHBOARD: '/dashboard',
        SUMMARIZE: '/summarize',
    },
};

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};
