import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brasa Certa — Calculadora de Churrasco",
  description: "Calcule carnes, acompanhamentos e o custo estimado do seu churrasco.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  metadataBase: new URL("https://brasa-certa-calculadora.ricardotakeya.chatgpt.site"),
  openGraph: {
    title: "Brasa Certa — Calculadora de Churrasco",
    description: "Churrasco bom começa na conta.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Brasa Certa — Churrasco bom começa na conta." }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brasa Certa — Calculadora de Churrasco",
    description: "Churrasco bom começa na conta.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
