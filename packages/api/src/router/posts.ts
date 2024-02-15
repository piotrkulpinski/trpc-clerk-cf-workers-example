import { idSchema } from "@repo/database"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx: { db, userId } }) => {
      return await db.post.findMany({
        orderBy: { createdAt: "desc" },
      })
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx: { db, userId }, input: { id } }) => {
      return await db.post.delete({
        where: { id },
      })
    }),
})
