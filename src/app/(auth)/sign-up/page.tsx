import { AuthForm } from "../auth-form";
import { signIn, signUp } from "../actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/dashboard" } = await searchParams;
  return <AuthForm initialMode="sign-up" next={next} signInAction={signIn} signUpAction={signUp} />;
}
