import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Controle Estoque & Vendas — Gestão para o seu negócio",
  description: "Controle de estoque, vendas e lucro para qualquer tipo de comércio. 2 meses grátis, sem cartão de crédito. Comece agora!",
  openGraph: {
    title: "Controle Estoque & Vendas — Gestão Completa",
    description: "Sistema completo para gerenciar estoque, vendas e margem do seu negócio. 2 meses grátis!",
    images: [
      {
        url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Controle Estoque & Vendas - Sistema de Gestão para o seu negócio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Controle Estoque & Vendas — Gestão Completa",
    description: "Sistema completo para gerenciar estoque, vendas e margem do seu negócio. 2 meses grátis!",
    images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=630&fit=crop"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}