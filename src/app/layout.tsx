import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankQuest | Adaptive JEE Main & Advanced Mastery",
  description:
    "Next-generation adaptive preparation platform for JEE Main & Advanced with Item Response Theory difficulty tiers, NTA mock interface, and deep performance analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen antialiased flex flex-col transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
