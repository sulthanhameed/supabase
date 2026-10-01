import { AuthForm } from "@/components/auth-form";
import { Suspense } from "react";

export const metadata = { title: "Login — Khang Chinese Restaurant & Dimsum" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
