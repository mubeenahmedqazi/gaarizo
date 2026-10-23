import { Suspense } from "react";
import AuthForm from "@/views/AuthForm";

export const metadata = { title: "Login - Gaarizo" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
