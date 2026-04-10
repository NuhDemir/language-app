// src/features/courses/types/errors.types.ts
// Error types for course-related API calls

export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
}

export enum CourseErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    ALREADY_ENROLLED = 'ALREADY_ENROLLED',
    COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    SERVER_ERROR = 'SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface CourseError {
    type: CourseErrorType;
    message: string;
    statusCode?: number;
    originalError?: any;
    retryable: boolean;
}

/**
 * Parse API error into CourseError
 */
export function parseApiError(error: any): CourseError {
    // Network error (no response)
    if (!error.response && error.request) {
        return {
            type: CourseErrorType.NETWORK_ERROR,
            message: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
            retryable: true,
            originalError: error,
        };
    }

    const statusCode = error.statusCode || error.response?.status;
    const apiMessage = error.message || error.response?.data?.message;
    const message = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;

    // 401 Unauthorized (token expired)
    if (statusCode === 401) {
        return {
            type: CourseErrorType.UNAUTHORIZED,
            message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
            statusCode,
            retryable: false,
            originalError: error,
        };
    }

    // 404 Not Found
    if (statusCode === 404) {
        return {
            type: CourseErrorType.COURSE_NOT_FOUND,
            message: 'Kurs bulunamadı.',
            statusCode,
            retryable: false,
            originalError: error,
        };
    }

    // 409 Conflict (already enrolled)
    if (statusCode === 409) {
        return {
            type: CourseErrorType.ALREADY_ENROLLED,
            message: 'Bu kursa zaten kayıtlısınız.',
            statusCode,
            retryable: false,
            originalError: error,
        };
    }

    // 400 Bad Request (validation error)
    if (statusCode === 400) {
        return {
            type: CourseErrorType.VALIDATION_ERROR,
            message: message || 'Geçersiz istek.',
            statusCode,
            retryable: false,
            originalError: error,
        };
    }

    // 500+ Server Error
    if (statusCode >= 500) {
        return {
            type: CourseErrorType.SERVER_ERROR,
            message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
            statusCode,
            retryable: true,
            originalError: error,
        };
    }

    // Unknown error
    return {
        type: CourseErrorType.UNKNOWN_ERROR,
        message: message || 'Bir hata oluştu.',
        statusCode,
        retryable: true,
        originalError: error,
    };
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: CourseError): string {
    return error.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: CourseError): boolean {
    return error.retryable;
}
