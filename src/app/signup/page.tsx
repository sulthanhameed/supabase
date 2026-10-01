import { AuthForm } from "@/components/auth-form";
import { Suspense } from "react";

export const metadata = { title: "Sign up — Khang Chinese Restaurant & Dimsum" };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
