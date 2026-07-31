import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Chaveiro Pro — Gestão de Estoque e Vendas",
  description: "Sistema de gestão de estoque e vendas para chaveiros. 2 meses grátis, sem cartão de crédito. Comece agora!",
  openGraph: {
    title: "Chaveiro Pro — Gestão Completa",
    description: "Sistema profissional para chaveiros gerenciar estoque e vendas. 2 meses grátis!",
    images: [
      {
        url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Chaveiro Pro - Sistema de Gestão de Estoque e Vendas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaveiro Pro — Gestão Completa",
    description: "Sistema profissional para chaveiros gerenciar estoque e vendas. 2 meses grátis!",
    images: ["https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=630&fit=crop"],
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