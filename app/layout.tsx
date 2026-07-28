import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brasa Certa — Calculadora de Churrasco",
  description: "Calcule carnes, acompanhamentos e o custo estimado do seu churrasco.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
