import type { ExecutionContext } from "@cloudflare/workers-types"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter, createTRPCContext } from "@repo/api"

export interface Env {
  CLERK_SECRET_KEY: string
  DATABASE_URL: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleCORSPreflight()
    }

    const secretKey = env.CLERK_SECRET_KEY
    const databaseUrl = env.DATABASE_URL

    const response = await fetchRequestHandler({
      req: request,
      endpoint: "",
      router: appRouter,
      createContext: () =>
        createTRPCContext({ secretKey, databaseUrl, req: request, resHeaders: new Headers() }),
      onError: ({ path, error }) => {
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`)
      },
    })

    return addCORSHeaders(response)
  },
}

const addCORSHeaders = (res: Response) => {
  const response = new Response(res.body, res)

  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Headers", "*")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

  return response
}

const handleCORSPreflight = () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  })
}
