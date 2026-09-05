-- Dados do negócio (cabeçalho do recibo)
ALTER TABLE "User" ADD COLUMN "empresaNome" TEXT;
ALTER TABLE "User" ADD COLUMN "empresaDocumento" TEXT;
ALTER TABLE "User" ADD COLUMN "empresaTelefone" TEXT;
ALTER TABLE "User" ADD COLUMN "empresaEndereco" TEXT;

-- Campos do recibo na venda
ALTER TABLE "Sale" ADD COLUMN "numero" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Sale" ADD COLUMN "clienteNome" TEXT;
ALTER TABLE "Sale" ADD COLUMN "clienteContato" TEXT;
ALTER TABLE "Sale" ADD COLUMN "pagamento" TEXT;
ALTER TABLE "Sale" ADD COLUMN "token" TEXT;

-- Backfill: numero sequencial por usuário nas vendas já existentes
WITH numerado AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt", "id") AS n
  FROM "Sale"
)
UPDATE "Sale" s SET "numero" = numerado.n
FROM numerado WHERE s."id" = numerado."id";

-- Backfill: token público único para vendas já existentes
UPDATE "Sale"
SET "token" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "token" IS NULL;

ALTER TABLE "Sale" ALTER COLUMN "token" SET NOT NULL;
CREATE UNIQUE INDEX "Sale_token_key" ON "Sale"("token");
CREATE INDEX "Sale_userId_numero_idx" ON "Sale"("userId", "numero");
