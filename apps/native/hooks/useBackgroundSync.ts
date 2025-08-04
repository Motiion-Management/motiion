import { useRef, useCallback, useEffect } from 'react';

interface SyncTask {
  id: string;
  action: () => Promise;
  retries: number;
  maxRetries: number;
}

/**
 * Hook for queueing and executing background sync tasks
 * Allows fire-and-forget updates that don't block user interactions
 */
export function useBackgroundSync() {
  const taskQueue = useRef<SyncTask[]>([]);
  const isProcessing = useRef(false);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (isProcessing.current || taskQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const task = taskQueue.current.shift();

    if (task) {
      try {
        await task.action();
      } catch (error) {
        console.warn(`Background sync failed for task ${task.id}:`, error);

        // Retry if under limit
        if (task.retries < task.maxRetries) {
          task.retries++;
          // Re-queue with exponential backoff
          setTimeout(
            () => {
              taskQueue.current.push(task);
              processQueue();
            },
            Math.pow(2, task.retries) * 1000
          );
        }
      }
    }

    isProcessing.current = false;

    // Process next task if any
    if (taskQueue.current.length > 0) {
      processQueue();
    }
  }, []);

  // Queue a background task
  const queueTask = useCallback(
    (action: () => Promise, options: { id?: string; maxRetries?: number } = {}) => {
      const task: SyncTask = {
        id: options.id || `task-${Date.now()}`,
        action,
        retries: 0,
        maxRetries: options.maxRetries || 3,
      };

      taskQueue.current.push(task);

      // Start processing if not already
      setTimeout(processQueue, 0);
    },
    [processQueue]
  );

  // Clear queue on unmount
  useEffect(() => {
    return () => {
      taskQueue.current = [];
    };
  }, []);

  return {
    queueTask,
    hasPendingTasks: () => taskQueue.current.length > 0,
  };
}
