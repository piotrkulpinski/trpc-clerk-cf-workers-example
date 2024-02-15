"use client"

import type { QueryClientConfig } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client"
import { useState } from "react"
import superjson from "superjson"

import { env, isDev } from "~/env"
import { api } from "~/services/trpc"

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 1_000 * 60 * 5,
    },
  },
}

type TRPCProviderProps = {
  children: React.ReactNode
  headers: Headers
  sessionId: string | null
  token: string | null
}

export function TRPCProvider({ children, headers, sessionId, token }: TRPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: opts => isDev || (opts.direction === "down" && opts.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: env.NEXT_PUBLIC_API_URL,
          headers() {
            const headerMap = new Map(headers)

            // Set the source header to react
            headerMap.set("x-trpc-source", "react")

            // Set the auth headers if they exist
            token && headerMap.set("x-clerk-auth-token", token)
            sessionId && headerMap.set("x-clerk-auth-session-id", sessionId)

            return Object.fromEntries(headerMap)
          },
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </api.Provider>
    </QueryClientProvider>
  )
}
