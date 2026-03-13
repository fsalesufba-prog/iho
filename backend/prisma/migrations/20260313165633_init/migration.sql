-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "planoId" INTEGER NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtivacao" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "diasAtraso" INTEGER NOT NULL DEFAULT 0,
    "implantacaoPaga" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamentoImplantacao" TIMESTAMP(3),
    "assinaturaId" TEXT,
    "cartaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorImplantacao" DOUBLE PRECISION NOT NULL,
    "valorMensal" DOUBLE PRECISION NOT NULL,
    "limiteAdm" INTEGER NOT NULL,
    "limiteControlador" INTEGER NOT NULL,
    "limiteApontador" INTEGER NOT NULL,
    "limiteEquipamentos" INTEGER NOT NULL,
    "recursos" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "empresaId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcesso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "empresaId" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataPrevisaoTermino" TIMESTAMP(3),
    "dataTermino" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrenteServico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "obraId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrenteServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentroCusto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "obraId" INTEGER,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentroCusto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoCentroCusto" (
    "id" SERIAL NOT NULL,
    "centroCustoId" INTEGER NOT NULL,
    "dataAvaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avaliadorId" INTEGER NOT NULL,
    "precoCondicoes" DOUBLE PRECISION NOT NULL,
    "qualidadeServico" DOUBLE PRECISION NOT NULL,
    "qualidadeEntrega" DOUBLE PRECISION NOT NULL,
    "segurancaSaude" DOUBLE PRECISION NOT NULL,
    "estoque" DOUBLE PRECISION NOT NULL,
    "administracao" DOUBLE PRECISION NOT NULL,
    "ocorrencias" TEXT,
    "notaFinal" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoCentroCusto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anoFabricacao" INTEGER NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "placa" TEXT,
    "horaAtual" INTEGER NOT NULL DEFAULT 0,
    "kmAtual" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "obraId" INTEGER,
    "frenteServicoId" INTEGER,
    "centroCustoId" INTEGER,
    "empresaId" INTEGER NOT NULL,
    "valorAquisicao" DOUBLE PRECISION,
    "valorDepreciacaoAnual" DOUBLE PRECISION,
    "dataAquisicao" TIMESTAMP(3),
    "vidaUtilAnos" INTEGER DEFAULT 5,
    "valorResidual" DOUBLE PRECISION DEFAULT 0,
    "valorLocacaoDiaria" DOUBLE PRECISION,
    "valorLocacaoMensal" DOUBLE PRECISION,
    "comOperador" BOOLEAN NOT NULL DEFAULT false,
    "planoManutencao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" SERIAL NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataProgramada" TIMESTAMP(3),
    "dataRealizada" TIMESTAMP(3),
    "descricao" TEXT NOT NULL,
    "observacoes" TEXT,
    "horasEquipamento" INTEGER NOT NULL,
    "custo" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'programada',
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManutencaoItem" (
    "id" SERIAL NOT NULL,
    "manutencaoId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DOUBLE PRECISION,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManutencaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apontamento" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipamentoId" INTEGER NOT NULL,
    "frenteServicoId" INTEGER NOT NULL,
    "operadorId" INTEGER,
    "horasInicial" INTEGER NOT NULL,
    "horasFinal" INTEGER NOT NULL,
    "horasTrabalhadas" INTEGER NOT NULL,
    "combustivelLitros" DOUBLE PRECISION,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Apontamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoEquipamento" (
    "id" SERIAL NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "obraOrigemId" INTEGER,
    "obraDestinoId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "estoqueMinimo" INTEGER NOT NULL,
    "estoqueMaximo" INTEGER NOT NULL,
    "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
    "valorUnitario" DOUBLE PRECISION,
    "localizacao" TEXT,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueMovimento" (
    "id" SERIAL NOT NULL,
    "estoqueId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DOUBLE PRECISION,
    "valorTotal" DOUBLE PRECISION,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipamentoId" INTEGER,
    "observacao" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstoqueMovimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "transacaoId" TEXT,
    "reciboUrl" TEXT,
    "linkPagamento" TEXT,
    "qrCode" TEXT,
    "linhaDigitavel" TEXT,
    "urlBoleto" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "empresaId" INTEGER,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER,
    "dadosAntigos" TEXT,
    "dadosNovos" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "imagem" TEXT,
    "autor" TEXT NOT NULL,
    "autorAvatar" TEXT,
    "autorBio" TEXT,
    "categoria" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "dataPublicacao" TIMESTAMP(3),
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentario" (
    "id" SERIAL NOT NULL,
    "blogId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "comentario" TEXT NOT NULL,
    "parentId" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "blogId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" SERIAL NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "empresa" TEXT,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "resposta" TEXT,
    "respondidoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_notificacao" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "emailAlertas" BOOLEAN NOT NULL DEFAULT true,
    "emailRelatorios" BOOLEAN NOT NULL DEFAULT false,
    "emailManutencoes" BOOLEAN NOT NULL DEFAULT true,
    "emailPromocoes" BOOLEAN NOT NULL DEFAULT false,
    "sistemaAlertas" BOOLEAN NOT NULL DEFAULT true,
    "sistemaManutencoes" BOOLEAN NOT NULL DEFAULT true,
    "sistemaRelatorios" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_email_key" ON "Empresa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Plano_nome_key" ON "Plano"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Obra_codigo_key" ON "Obra"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "CentroCusto_codigo_empresaId_key" ON "CentroCusto"("codigo", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_tag_key" ON "Equipamento"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Estoque_codigo_key" ON "Estoque"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_transacaoId_key" ON "Pagamento"("transacaoId");

-- CreateIndex
CREATE INDEX "Pagamento_empresaId_idx" ON "Pagamento"("empresaId");

-- CreateIndex
CREATE INDEX "Pagamento_status_idx" ON "Pagamento"("status");

-- CreateIndex
CREATE INDEX "Pagamento_transacaoId_idx" ON "Pagamento"("transacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_slug_key" ON "blog"("slug");

-- CreateIndex
CREATE INDEX "comentario_blogId_idx" ON "comentario"("blogId");

-- CreateIndex
CREATE INDEX "comentario_parentId_idx" ON "comentario"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "like_usuarioId_blogId_key" ON "like"("usuarioId", "blogId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Contato_status_idx" ON "Contato"("status");

-- CreateIndex
CREATE INDEX "Contato_email_idx" ON "Contato"("email");

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_notificacao_empresaId_key" ON "configuracao_notificacao"("empresaId");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteServico" ADD CONSTRAINT "FrenteServico_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CentroCusto" ADD CONSTRAINT "CentroCusto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CentroCusto" ADD CONSTRAINT "CentroCusto_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoCentroCusto" ADD CONSTRAINT "AvaliacaoCentroCusto_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "CentroCusto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoCentroCusto" ADD CONSTRAINT "AvaliacaoCentroCusto_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_frenteServicoId_fkey" FOREIGN KEY ("frenteServicoId") REFERENCES "FrenteServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "CentroCusto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManutencaoItem" ADD CONSTRAINT "ManutencaoItem_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apontamento" ADD CONSTRAINT "Apontamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apontamento" ADD CONSTRAINT "Apontamento_frenteServicoId_fkey" FOREIGN KEY ("frenteServicoId") REFERENCES "FrenteServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apontamento" ADD CONSTRAINT "Apontamento_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEquipamento" ADD CONSTRAINT "HistoricoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEquipamento" ADD CONSTRAINT "HistoricoEquipamento_obraOrigemId_fkey" FOREIGN KEY ("obraOrigemId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEquipamento" ADD CONSTRAINT "HistoricoEquipamento_obraDestinoId_fkey" FOREIGN KEY ("obraDestinoId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEquipamento" ADD CONSTRAINT "HistoricoEquipamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_notificacao" ADD CONSTRAINT "configuracao_notificacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
