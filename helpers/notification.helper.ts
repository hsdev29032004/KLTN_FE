import { toast } from 'sonner';

interface ApiResponse {
    message?: string;
    [key: string]: any;
}

/**
 * Check if running on client-side
 */
const isClient = () => typeof window !== 'undefined';

/**
 * Helper function to automatically show notifications based on API responses
 * Only works on client-side (browser environment)
 */
export const showApiNotification = {
    /**
     * Show notification based on HTTP status and response message
     * @param status HTTP status code
     * @param data Response data
     */
    fromResponse(status: number, data: ApiResponse) {
        // Only show notifications on client-side
        if (!isClient()) return;

        const message = data?.message;

        // Only show notification if message exists
        if (!message) return;

        // Determine notification type based on status code
        if (status >= 200 && status < 300) {
            // Success (2xx)
            toast.success(message);
        } else if (status >= 300 && status < 400) {
            // Redirect (3xx) - treat as info
            toast.info(message);
        } else if (status >= 400 && status < 500) {
            // Client error (4xx)
            toast.error(message);
        } else if (status >= 500) {
            // Server error (5xx)
            toast.error(message);
        }
    },

    /**
     * Show error notification from error response
     * @param error Error object with response
     */
    fromError(error: any) {
        // Only show notifications on client-side
        if (!isClient()) return;

        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message;

        if (!message) return;

        if (status) {
            this.fromResponse(status, { message });
        } else {
            // Network error or unknown error
            toast.error(message || 'An error occurred');
        }
    },

    /**
     * Manually show success notification
     */
    success(message: string) {
        if (!isClient()) return;
        toast.success(message);
    },

    /**
     * Manually show error notification
     */
    error(message: string) {
        if (!isClient()) return;
        toast.error(message);
    },

    /**
     * Manually show info notification
     */
    info(message: string) {
        if (!isClient()) return;
        toast.info(message);
    },

    /**
     * Manually show warning notification
     */
    warning(message: string) {
        if (!isClient()) return;
        toast.warning(message);
    },
};
