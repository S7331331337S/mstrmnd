import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { isUiPreview } from "@/lib/preview";

export default function SignupPage() {
  return (
    <main className="hero-atmosphere relative min-h-screen overflow-hidden">
      <div className="hero-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-10 animate-rise">
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.34em] text-[var(--platinum)]"
          >
            MSTRMND
          </Link>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-zinc-50">
            Create account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Seed a private profile through conversation — not a form.
          </p>
        </div>
        <div className="animate-rise-delay-1 rounded-2xl border border-zinc-800/90 bg-black/35 p-6 backdrop-blur-sm">
          {isUiPreview() ? (
            <p className="mb-4 rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400">
              UI preview mode — skip ahead to{" "}
              <Link href="/onboarding" className="text-[var(--platinum)] underline-offset-2 hover:underline">
                onboarding
              </Link>
              .
            </p>
          ) : null}
          <AuthForm mode="signup" />
        </div>
        <p className="animate-rise-delay-2 mt-6 text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-200 underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
