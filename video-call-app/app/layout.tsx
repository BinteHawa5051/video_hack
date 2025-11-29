import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Call with Live Captions",
  description: "Real-time video calling with live speech-to-text captioning and multi-language translation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
