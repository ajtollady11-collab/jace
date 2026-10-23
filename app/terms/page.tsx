import type { Metadata } from "next";
import LegalPlaceholder from "@/components/LegalPlaceholder";

export const metadata: Metadata = { title: "Terms of Service | Jace Sullivan", robots: { index: false } };

export default function TermsPage() {
  return <LegalPlaceholder title="Terms of Service" />;
}
