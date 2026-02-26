import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const font = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: ["400"],
});


export const metadata: Metadata = {
  title: "romii",
  description: "Portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
