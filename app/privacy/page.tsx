import type { Metadata } from "next";
import LegalPlaceholder from "@/components/LegalPlaceholder";

export const metadata: Metadata = { title: "Privacy Policy | Jace Sullivan", robots: { index: false } };

export default function PrivacyPage() {
  return <LegalPlaceholder title="Privacy Policy" />;
}
