/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';

export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
const BREAKPOINT_KEYS = Object.keys(BREAKPOINTS) as Breakpoint[];
const BREAKPOINT_QUERIES = BREAKPOINT_KEYS.map((key, idx) => {
  const maxW = BREAKPOINTS[BREAKPOINT_KEYS[idx + 1]];
  let query = `(min-width: ${BREAKPOINTS[key]}px)`;
  if (maxW) {
    query += ` and (max-width: ${maxW - 1}px)`;
  }

  return {
    query,
    breakpoint: key,
  };
});

const QUERY_STRINGS = BREAKPOINT_QUERIES.map((query) => query.query);

export function useBreakpoint() {
  const values = useMediaQuery(QUERY_STRINGS);
  return useMemo(() => {
    const index = values.findIndex((value) => value);
    return BREAKPOINT_QUERIES[index]?.breakpoint;
  }, [values]);
}

export function useBreakpointValue<T = any>(
  values: Partial<Record<Breakpoint | 'base', T>> | T[],
): T | undefined {
  const breakpoint = useBreakpoint();

  /**
   * Get the sorted breakpoint keys from the provided breakpoints
   */
  const obj: Partial<Record<string, T>> = Array.isArray(values)
    ? Object.fromEntries(
        BREAKPOINT_KEYS.map((key, index) => [key, values[index]]),
      )
    : values;

  if (!breakpoint) {
    return;
  }

  if (breakpoint in obj) {
    return obj[breakpoint];
  }

  // get closest breakpoint
  const index = BREAKPOINT_KEYS.indexOf(breakpoint);
  const closest = BREAKPOINT_KEYS.slice(0, index)
    .reverse()
    .find((key) => key in obj);

  if (closest) {
    return obj[closest];
  }
}

interface RefCountedMediaQueryList extends MediaQueryList {
  refCount: number;
}

const matchersByWindow = new WeakMap<
  Window,
  Map<string, RefCountedMediaQueryList>
>();

function getMatcher(
  query: string | null,
  targetWindow?: Window,
): RefCountedMediaQueryList | undefined {
  if (!query || !targetWindow) {
    return undefined;
  }

  const matchers =
    matchersByWindow.get(targetWindow) ||
    new Map<string, RefCountedMediaQueryList>();

  matchersByWindow.set(targetWindow, matchers);

  let mql = matchers.get(query);
  if (!mql) {
    mql = targetWindow.matchMedia(query) as RefCountedMediaQueryList;
    mql.refCount = 0;
    matchers.set(mql.media, mql);
  }

  return mql;
}

/**
 * React hook that tracks state of a CSS media query
 */
export function useMediaQuery(
  query: string | string[],
  targetWindow: Window | undefined = typeof window === 'undefined'
    ? undefined
    : window,
): boolean[] {
  const queries = useMemo(
    () => (Array.isArray(query) ? query : [query]),
    [query],
  );

  const [value, setValue] = useState(() => {
    return queries.map((q) => ({
      media: q,
      matches: getMatcher(q, targetWindow)?.matches ?? false,
    }));
  });

  useEffect(() => {
    setValue(
      queries.map((q) => ({
        media: q,
        matches: getMatcher(q, targetWindow)?.matches ?? false,
      })),
    );

    const mqls = queries.map((q) => getMatcher(q, targetWindow));

    const handler = (evt: MediaQueryListEvent) => {
      setValue((prev) => {
        return prev.slice().map((item) => {
          if (item.media === evt.media)
            return { ...item, matches: evt.matches };
          return item;
        });
      });
    };

    mqls.forEach((mql) => {
      if (!mql) return;

      if (typeof mql.addListener === 'function') {
        mql.addListener(handler);
      } else {
        mql.addEventListener('change', handler);
      }
    });

    return () => {
      mqls.forEach((mql) => {
        if (!mql) return;

        if (typeof mql.removeListener === 'function') {
          mql.removeListener(handler);
        } else {
          mql.removeEventListener('change', handler);
        }
      });
    };
  }, [queries, targetWindow]);

  return value.map((item) => item.matches);
}
