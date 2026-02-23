'use client';

import { useNotification } from '@/hooks/use-notification';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

/**
 * Example component demonstrating the notification system usage
 * Remove this file after understanding how to use notifications
 */
export default function NotificationDemo() {
  const { success, error, info, warning, loading, dismiss, dismissAll } =
    useNotification();

  const handleLoadingDemo = async () => {
    const id = loading('Processing your request...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dismiss(id);
    success('Processing complete!');
  };

  const handlePromiseDemo = () => {
    toast.promise(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ name: 'Event' }), 2000)
        ),
      {
        loading: 'Loading...',
        success: (data: any) => `${data.name} has been created`,
        error: 'Error',
      }
    );
  };

  const handleWithAction = () => {
    toast.info('User deleted successfully', {
      action: {
        label: 'Undo',
        onClick: () => info('Restoration initiated...'),
      },
    });
  };

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Notification Examples</h2>
        <p className="text-sm text-muted-foreground">
          Click buttons to test different notification types
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => success('Operation successful!')}
          variant="outline"
        >
          Success
        </Button>

        <Button onClick={() => error('Something went wrong!')} variant="outline">
          Error
        </Button>

        <Button onClick={() => info('Here is some information')} variant="outline">
          Info
        </Button>

        <Button onClick={() => warning('Please be careful!')} variant="outline">
          Warning
        </Button>

        <Button onClick={handleLoadingDemo} variant="outline">
          Loading Demo
        </Button>

        <Button onClick={handlePromiseDemo} variant="outline">
          Promise Demo
        </Button>

        <Button onClick={handleWithAction} variant="outline">
          With Action
        </Button>

        <Button onClick={dismissAll} variant="outline">
          Clear All
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="font-semibold">Example Alerts:</h3>
        <div className="space-y-3">
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your operation completed successfully!
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>

          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational message for you.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please be careful with this action.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="mt-8 space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Quick Start Code:</h3>
        <pre className="overflow-x-auto rounded bg-muted p-3 text-sm">
          {`import { useNotification } from '@/hooks/use-notification';

export default function MyComponent() {
  const { success, error, loading, dismiss } = useNotification();

  const handleClick = async () => {
    const id = loading('Processing...');
    try {
      // Your async operation
      await doSomething();
      dismiss(id);
      success('Done!');
    } catch (err) {
      dismiss(id);
      error('Failed!');
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}`}
        </pre>
      </div>
    </div>
  );
}
