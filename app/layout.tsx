import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "staydangerous",
  description: "Stay dangerous with a bold Next.js 14 experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-red-500">
        {children}
      </body>
    </html>
  );
}
