"use client"

import { api } from "~/services/trpc"

export default function Page() {
  const apiUtils = api.useUtils()
  const { data } = api.posts.getAll.useQuery()

  const deletePost = api.posts.delete.useMutation({
    onSuccess: async () => {
      await apiUtils.posts.getAll.invalidate()
      alert("Post deleted")
    },
  })

  return (
    <>
      {data?.map(post => (
        <>
          <h1>{post.title}</h1>
          <div>{post.content}</div>
          <button onClick={() => deletePost.mutate({ id: post.id })}>Delete Post</button>
        </>
      ))}
    </>
  )
}
