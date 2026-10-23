import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const brideName = process.env.NEXT_PUBLIC_BRIDE_NAME ?? "Novia";
const groomName = process.env.NEXT_PUBLIC_GROOM_NAME ?? "Novio";

export const metadata: Metadata = {
  title: `${brideName} & ${groomName} — Casamiento`,
  description: `Sitio oficial del casamiento de ${brideName} y ${groomName}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
