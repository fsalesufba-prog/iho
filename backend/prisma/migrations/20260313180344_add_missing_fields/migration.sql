/*
  Warnings:

  - Added the required column `updatedAt` to the `AvaliacaoCentroCusto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AvaliacaoCentroCusto" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CentroCusto" ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo';

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "nextBillingAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FrenteServico" ADD COLUMN     "progresso" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Obra" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "valor" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "cargo" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "telefone" TEXT;

-- CreateTable
CREATE TABLE "ModeloMedicao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "empresaId" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "campos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeloMedicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "obraId" INTEGER NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "horasTotal" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "modeloId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "dataEmissao" TIMESTAMP(3),
    "dataAprovacao" TIMESTAMP(3),
    "aprovadoPorId" INTEGER,
    "observacoesAprovacao" TEXT,
    "motivoCancelamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicaoEquipamento" (
    "id" SERIAL NOT NULL,
    "medicaoId" INTEGER NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "horasTrabalhadas" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicaoEquipamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medicao" ADD CONSTRAINT "Medicao_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicao" ADD CONSTRAINT "Medicao_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ModeloMedicao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicao" ADD CONSTRAINT "Medicao_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicao" ADD CONSTRAINT "Medicao_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicaoEquipamento" ADD CONSTRAINT "MedicaoEquipamento_medicaoId_fkey" FOREIGN KEY ("medicaoId") REFERENCES "Medicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicaoEquipamento" ADD CONSTRAINT "MedicaoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
