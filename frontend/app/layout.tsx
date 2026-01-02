import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Mambo Inn | Gamify Your Dance",
  description: "Structured courses. Real feedback. Stop memorizing steps—start mastering the game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-mambo-dark`}>
        <AuthProvider>
          {children}
          <GlobalAudioPlayer />
        </AuthProvider>
      </body>
    </html>
  );
}
