import { isAxiosError } from 'axios';
import { ApiErrorResponse } from '@/types';

/**
 * Parses unknown errors (typically from Axios) into a user-friendly string.
 * Extracts Laravel ValidationException messages if present.
 */
export function parseApiError(err: unknown, defaultMessage: string = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
    if (isAxiosError<ApiErrorResponse>(err)) {
        // If Laravel returns validation errors (422)
        if (err.response?.data?.errors) {
            const firstErrorField = Object.values(err.response.data.errors)[0];
            if (firstErrorField && firstErrorField.length > 0) {
                return firstErrorField[0];
            }
        }
        
        // If Laravel returns a generic message (e.g. 401 Unauthorized)
        if (err.response?.data?.message) {
            return err.response.data.message;
        }

        // Network errors or timeout
        return err.message || defaultMessage;
    }

    if (err instanceof Error) {
        return err.message;
    }

    return defaultMessage;
}
