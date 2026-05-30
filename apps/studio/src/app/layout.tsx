import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/LanguageSwitcher";

export const metadata: Metadata = {
  title: "MetaForge Studio",
  description: "Metadata-driven application runtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
