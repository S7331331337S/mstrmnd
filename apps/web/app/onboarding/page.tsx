import { OnboardingChat } from "@/components/onboarding-chat";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.24em] text-zinc-500">MSTRMND · ONBOARDING</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Intelligence gathering
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Talk with eve. It will seed identity, goals, signal preferences, style,
          and context into your private profile — then unlock the dashboard.
        </p>
      </header>
      <OnboardingChat />
    </main>
  );
}
