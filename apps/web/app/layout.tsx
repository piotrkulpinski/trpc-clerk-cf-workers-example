import { auth, ClerkProvider } from "@clerk/nextjs"
import { headers } from "next/headers"
import type { PropsWithChildren } from "react"

import { TRPCProvider } from "~/providers/trpc-provider"

export default async function RootLayout({ children }: PropsWithChildren) {
  const { sessionId, getToken } = auth()
  const token = await getToken()

  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <ClerkProvider
          appearance={{
            layout: { socialButtonsVariant: "blockButton", shimmer: true },
            variables: { colorPrimary: "black" },
            elements: {
              rootBox: "w-full h-full",
              main: "gap-6",
              card: "w-full m-0 p-0 gap-4 bg-transparent shadow-none",
              header: "hidden",
              logoBox: "hidden",
              dividerLine: "bg-outline",
              formButtonPrimary: "bg-black text-white font-medium text-sm py-3 px-6 normal-case",
              formFieldLabel: "mb-1",
              formFieldInput: "border-outline",
              footerActionText: "text-xs opacity-60",
              footerActionLink: "text-xs underline focus:shadow-none",
              socialButtonsBlockButton: "bg-white border-outline tracking-wide hover:bg-gray-50",
              socialButtonsBlockButton__google: "order-first",
            },
          }}
        >
          <TRPCProvider headers={headers()} sessionId={sessionId} token={token}>
            {children}
          </TRPCProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
