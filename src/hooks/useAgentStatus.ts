"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AgentTask } from "@/types/agent";

const POLL_INTERVAL_MS = 2000;

interface UseAgentStatusReturn {
  task: AgentTask | null;
  isPolling: boolean;
  error: string | null;
  pollTaskStatus: (taskId: string) => void;
  stopPolling: () => void;
}

export function useAgentStatus(): UseAgentStatusReturn {
  const [task, setTask] = useState<AgentTask | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTaskIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    activeTaskIdRef.current = null;
    setIsPolling(false);
  }, []);

  const fetchTaskStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await fetch(
          `/api/agent/status?taskId=${encodeURIComponent(taskId)}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch task status: ${response.status}`
          );
        }

        const data: AgentTask = await response.json();
        setTask(data);
        setError(null);

        // Auto-stop on terminal states
        if (data.status === "completed" || data.status === "failed") {
          stopPolling();
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch task status";
        setError(errorMessage);
        stopPolling();
      }
    },
    [stopPolling]
  );

  const pollTaskStatus = useCallback(
    (taskId: string) => {
      // Stop any existing poll
      stopPolling();

      activeTaskIdRef.current = taskId;
      setIsPolling(true);
      setError(null);
      setTask(null);

      // Fetch immediately, then poll on interval
      fetchTaskStatus(taskId);

      intervalRef.current = setInterval(() => {
        if (activeTaskIdRef.current === taskId) {
          fetchTaskStatus(taskId);
        }
      }, POLL_INTERVAL_MS);
    },
    [fetchTaskStatus, stopPolling]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    task,
    isPolling,
    error,
    pollTaskStatus,
    stopPolling,
  };
}
