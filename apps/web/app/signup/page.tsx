import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs tracking-[0.24em] text-zinc-500">MSTRMND</p>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Seed a private profile through conversation — not a form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm mode="signup" />
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-200 underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
