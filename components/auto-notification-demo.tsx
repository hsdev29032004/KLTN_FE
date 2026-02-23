'use client';

import { Button } from '@/components/ui/button';
import { showApiNotification } from '@/helpers/notification.helper';
import { useNotification } from '@/hooks/use-notification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Demo component for Auto Notification System
 * Demonstrates automatic notifications from API responses
 */
export default function AutoNotificationDemo() {
    const { loading, dismiss } = useNotification();

    // Simulate success API response
    const simulateSuccessResponse = () => {
        showApiNotification.fromResponse(200, {
            message: 'Data saved successfully!',
        });
    };

    // Simulate error API response
    const simulateErrorResponse = () => {
        showApiNotification.fromResponse(400, {
            message: 'Invalid request parameters',
        });
    };

    // Simulate server error
    const simulateServerError = () => {
        showApiNotification.fromResponse(500, {
            message: 'Internal server error occurred',
        });
    };

    // Simulate API call with loading
    const simulateApiWithLoading = async () => {
        const id = loading('Fetching data...');

        await new Promise((resolve) => setTimeout(resolve, 2000));

        dismiss(id);
        showApiNotification.success('Data fetched successfully!');
    };

    // Simulate response without message (no notification)
    const simulateNoMessage = () => {
        showApiNotification.fromResponse(200, {
            data: 'Some data',
        });

        // Show info to user
        setTimeout(() => {
            showApiNotification.info('No notification shown - response had no message');
        }, 100);
    };

    return (
        <div className="mx-auto space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Auto Notification System Demo</CardTitle>
                    <CardDescription>
                        Automatic notifications based on API responses and HTTP status codes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Simulate API Responses:</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={simulateSuccessResponse} variant="default">
                                Success Response (200)
                            </Button>

                            <Button onClick={simulateErrorResponse} variant="destructive">
                                Client Error (400)
                            </Button>

                            <Button onClick={simulateServerError} variant="destructive">
                                Server Error (500)
                            </Button>

                            <Button onClick={simulateApiWithLoading} variant="secondary">
                                API with Loading
                            </Button>

                            <Button onClick={simulateNoMessage} variant="outline">
                                No Message (Silent)
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                        <h3 className="mb-2 font-semibold">How It Works:</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• <strong>200-299</strong>: Success notification (green)</li>
                            <li>• <strong>300-399</strong>: Info notification (blue)</li>
                            <li>• <strong>400-499</strong>: Error notification (red) - Client errors</li>
                            <li>• <strong>500-599</strong>: Error notification (red) - Server errors</li>
                            <li>• <strong>No message</strong>: No notification shown</li>
                        </ul>
                    </div>

                    <div className="mt-4 rounded-lg border p-4">
                        <h3 className="mb-2 font-semibold">Backend Response Format:</h3>
                        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                            {`// Success response
{
  "message": "Operation successful!",
  "data": { ... }
}

// Error response
{
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}

// Silent response (no notification)
{
  "data": { ... }
  // No message field
}`}
                        </pre>
                    </div>

                    <div className="mt-4 rounded-lg border p-4">
                        <h3 className="mb-2 font-semibold">Usage in Code:</h3>
                        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                            {`// Auto notification from API call
try {
  const response = await sdk.login(data);
  // If response.data.message exists
  // → Auto shows success notification
} catch (error) {
  // If error.response.data.message exists
  // → Auto shows error notification
}

// Manual notification (outside components)
import { showApiNotification } from '@/helpers/notification.helper';
showApiNotification.success('Manual success!');`}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
