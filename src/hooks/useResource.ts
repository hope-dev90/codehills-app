import { useCallback, useEffect, useRef, useState } from 'react';
import { contentService } from '../services/api';
import type { Destination, EventItem, LearningResource, Product, Story } from '../types';

interface ResourceState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads data through the services layer and exposes loading / error / reload state. */
export function useResource<T>(fetcher: () => Promise<T>, initial: T): ResourceState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);

  // Keep the ref in sync without triggering the render warning.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    fetcherRef
      .current()
      .then((result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Something went wrong');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

export const useStories = () => useResource<Story[]>(() => contentService.getStories(), []);
export const useProducts = () => useResource<Product[]>(() => contentService.getProducts(), []);
export const useDestinations = () =>
  useResource<Destination[]>(() => contentService.getDestinations(), []);
export const useEvents = () => useResource<EventItem[]>(() => contentService.getEvents(), []);
export const useLearningResources = () =>
  useResource<LearningResource[]>(() => contentService.getLearningResources(), []);
