import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Information Management System REST API",
  description: "Backend-only REST API for SIMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
