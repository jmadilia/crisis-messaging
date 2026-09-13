import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crisis Messaging Demo",
  description:
    "Demonstrate backend for crisis messaging in mental health application between therapist and patient.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
