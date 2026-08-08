import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs tracking-[0.24em] text-zinc-500">MSTRMND</p>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue to your private intelligence layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm mode="login" />
          <p className="text-sm text-zinc-500">
            No account yet?{" "}
            <Link href="/signup" className="text-zinc-200 underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
