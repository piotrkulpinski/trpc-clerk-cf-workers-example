import type { AppRouter } from "@repo/api"
import { createTRPCReact } from "@trpc/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import superjson from "superjson"

export const api = createTRPCReact<AppRouter>()

/**
 * Default TRPC transformer
 */
export const transformer = superjson

/**
 * Enum containing all api procedurec
 */
export type RouterProcedures = keyof AppRouter["_def"]["procedures"]

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
