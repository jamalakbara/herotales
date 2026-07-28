import { AuthForm } from "../auth-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/dashboard" } = await searchParams;
  return <AuthForm initialMode="sign-in" next={next} />;
}
