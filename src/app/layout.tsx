import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Météo du Bénin",
  description: "Météo actuelle et prévisions sur 7 jours des localités du Bénin, avec vigilance pluie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
