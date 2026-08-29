import { redirect } from "next/navigation";

/**
 * Onboarding is rendered by the stateful root application. This route gives
 * the OAuth callback an explicit new-user destination without duplicating UI.
 */
export default function OnboardingEntry() {
  redirect("/");
}
