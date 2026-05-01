import { AuthForm } from "../auth-form";
import { signIn, signUp } from "../actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/dashboard" } = await searchParams;
  return <AuthForm initialMode="sign-in" next={next} signInAction={signIn} signUpAction={signUp} />;
}
