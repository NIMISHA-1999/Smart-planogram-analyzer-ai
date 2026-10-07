import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planogram AI",
  description: "AI-powered shelf and planogram compliance analysis"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
