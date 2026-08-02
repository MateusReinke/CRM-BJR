import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Most API routes reply with { success: true, data } / { success: false, error }.
// These helpers unwrap that envelope in one place so pages can keep treating
// query results as plain arrays/objects.
async function parseJsonSafely(res: Response): Promise<any | undefined> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const body = await parseJsonSafely(res);
    const message = body?.error || res.statusText;
    throw new Error(`${res.status}: ${message}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Reads a Response from apiRequest and unwraps the { success, data } envelope.
export async function apiRequestData<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const res = await apiRequest(method, url, data);
  const body = await parseJsonSafely(res);
  return (body && typeof body === 'object' && 'data' in body ? body.data : body) as T;
}

// Builds a fetch URL from a query key shaped as [path] or [path, params].
// Keeping the params in their own key segment (instead of baked into the
// path string) is what lets invalidateQueries({queryKey: [path]}) partially
// match every parameterized variant of that query - TanStack Query matches
// key segments structurally, not by substring, so a filter key of
// ["/api/clients"] only matches a query keyed ["/api/clients?storeId=x"] if
// the two strings are exactly equal. Splitting the params out fixes that.
function buildUrlFromQueryKey(queryKey: readonly unknown[]): string {
  const [path, ...rest] = queryKey;
  if (typeof path !== 'string') {
    throw new Error("Query key must start with a string path");
  }
  if (rest.length === 0) {
    return path;
  }
  const [second] = rest;
  // A plain object second segment is treated as query params; anything else
  // (a plain id/month string, for a query keyed like ["/api/x/by-store", month])
  // is joined onto the path so it still partial-matches ["/api/x/by-store"].
  if (second && typeof second === 'object' && !Array.isArray(second)) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(second as Record<string, unknown>)) {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  }
  return [path, ...rest].join("/");
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(buildUrlFromQueryKey(queryKey), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const body = await parseJsonSafely(res);
    return body && typeof body === 'object' && 'data' in body ? body.data : body;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
