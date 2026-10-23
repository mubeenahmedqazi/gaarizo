import { Suspense } from "react";
import AuthForm from "@/views/AuthForm";

export const metadata = { title: "Sign Up - Gaarizo" };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
