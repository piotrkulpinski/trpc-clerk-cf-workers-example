import { Clerk } from "@clerk/backend"
import { getPrismaClient } from "@repo/database"
import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import type { typeToFlattenedError } from "zod"
import { ZodError } from "zod"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
type CreateContextOptions = FetchCreateContextFnOptions & {
  secretKey: string
  databaseUrl: string
}

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async ({ req, secretKey, databaseUrl }: CreateContextOptions) => {
  const db = getPrismaClient(databaseUrl)
  const clerk = Clerk({ secretKey })
  const token = req.headers.get("x-clerk-auth-token")
  const sessionId = req.headers.get("x-clerk-auth-session-id")

  if (!token || !sessionId) {
    return { userId: null, db }
  }

  const { userId } = await clerk.sessions.verifySession(sessionId, token)

  return { userId, db }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,

  errorFormatter: ({ shape, error }) => {
    let dataError: typeToFlattenedError<any, string> = {
      formErrors: [],
      fieldErrors: {},
    }

    // Zod error
    if (error.cause instanceof ZodError) {
      dataError = Object.assign(dataError, error.cause.flatten())
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        ...dataError,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      // infers the `userId` as non-nullable
      userId: ctx.userId,
    },
  })
})

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
