import { redirect } from 'next/navigation'

// Onboarding wizard removed — the Dashboard is the single place to manage content.
export default function OnboardingPage() {
  redirect('/dashboard')
}
