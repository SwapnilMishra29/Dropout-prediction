'use client';

import { useState, useCallback } from 'react';

interface LoadingState {
  stats: boolean;
  students: boolean;
  alerts: boolean;
  charts: boolean;
  all: boolean;
}

export function useDashboardLoading() {
  const [loading, setLoading] = useState<LoadingState>({
    stats: true,
    students: true,
    alerts: true,
    charts: true,
    all: true,
  });

  const setStatsLoaded = useCallback(() => {
    setLoading(prev => ({ ...prev, stats: false }));
  }, []);

  const setStudentsLoaded = useCallback(() => {
    setLoading(prev => ({ ...prev, students: false }));
  }, []);

  const setAlertsLoaded = useCallback(() => {
    setLoading(prev => ({ ...prev, alerts: false }));
  }, []);

  const setChartsLoaded = useCallback(() => {
    setLoading(prev => ({ ...prev, charts: false }));
  }, []);

  const setAllLoaded = useCallback(() => {
    setLoading({
      stats: false,
      students: false,
      alerts: false,
      charts: false,
      all: false,
    });
  }, []);

  return {
    loading,
    setStatsLoaded,
    setStudentsLoaded,
    setAlertsLoaded,
    setChartsLoaded,
    setAllLoaded,
  };
}

export function useTableLoading() {
  const [loading, setLoading] = useState(true);
  const setLoaded = useCallback(() => setLoading(false), []);
  
  return { loading, setLoaded };
}
