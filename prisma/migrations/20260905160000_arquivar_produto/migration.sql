-- Produto vendido nao pode ser apagado (quebraria o historico de vendas): passa a ser arquivado.
ALTER TABLE "Product" ADD COLUMN "arquivadoEm" TIMESTAMP(3);
