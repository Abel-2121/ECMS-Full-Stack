// hooks/useAutoRefresh.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAutoRefresh = (fetchFunction, interval = 10000, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchFunction]);

  const manualRefresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;
    
    fetchData(false);
    
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, interval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);

  const pauseAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeAutoRefresh = useCallback(() => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, interval);
    }
  }, [fetchData, interval, enabled]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    manualRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh
  };
};