import { AuthForm } from "../auth-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/dashboard" } = await searchParams;
  return <AuthForm initialMode="sign-up" next={next} />;
}
