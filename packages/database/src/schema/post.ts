import * as z from "zod"

import { idSchema } from "./index"

export const postDefaults = {
  title: "",
  content: "",
}

export const postSchema = z.object({
  title: z.string().trim().min(1, "This field is required"),
  content: z.string().nullish(),
})

export const createPostSchema = postSchema
export const updatePostSchema = postSchema.merge(idSchema)

export type PostSchema = z.infer<typeof postSchema>
