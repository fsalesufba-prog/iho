-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "motivoCancelamento" TEXT;

-- AlterTable
ALTER TABLE "Obra" ADD COLUMN     "progresso" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "Alerta" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "equipamentoId" INTEGER,
    "tipo" TEXT NOT NULL,
    "gravidade" TEXT NOT NULL DEFAULT 'media',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "lidoEm" TIMESTAMP(3),
    "valor" DOUBLE PRECISION,
    "limite" DOUBLE PRECISION,
    "diasRestantes" INTEGER,
    "diasAtraso" INTEGER,
    "data" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_alerta" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "limite" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL,
    "notificarEmail" BOOLEAN NOT NULL DEFAULT false,
    "notificarSistema" BOOLEAN NOT NULL DEFAULT true,
    "destinatarios" TEXT,
    "diasAntecedencia" INTEGER DEFAULT 7,
    "horarioNotificacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_log" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "tipo" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'pdf',
    "parametros" TEXT,
    "status" TEXT NOT NULL DEFAULT 'concluido',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_personalizado" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'pdf',
    "parametros" TEXT,
    "agendado" BOOLEAN NOT NULL DEFAULT false,
    "frequencia" TEXT,
    "proximaExecucao" TIMESTAMP(3),
    "ultimaExecucao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_personalizado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alerta_empresaId_idx" ON "Alerta"("empresaId");

-- CreateIndex
CREATE INDEX "Alerta_status_idx" ON "Alerta"("status");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_alerta_empresaId_tipo_key" ON "configuracao_alerta"("empresaId", "tipo");

-- CreateIndex
CREATE INDEX "relatorio_log_empresaId_idx" ON "relatorio_log"("empresaId");

-- CreateIndex
CREATE INDEX "relatorio_personalizado_empresaId_idx" ON "relatorio_personalizado"("empresaId");

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_alerta" ADD CONSTRAINT "configuracao_alerta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_log" ADD CONSTRAINT "relatorio_log_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_log" ADD CONSTRAINT "relatorio_log_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_personalizado" ADD CONSTRAINT "relatorio_personalizado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
