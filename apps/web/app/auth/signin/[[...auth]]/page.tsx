import { SignIn } from "@clerk/nextjs"

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>
}

const SignInPage = ({ searchParams }: PageProps) => {
  const redirectTo = searchParams.redirectTo as string | undefined

  return <SignIn redirectUrl={redirectTo} />
}

export default SignInPage
