// Status do sistema
export const STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
  CONCLUIDO: 'concluido',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  EM_ANDAMENTO: 'em_andamento',
  PROGRAMADO: 'programado',
  ATRASADO: 'atrasado',
} as const

// Tipos de usuário
export const USER_TYPES = {
  ADM_SISTEMA: 'adm_sistema',
  ADM_EMPRESA: 'adm_empresa',
  CONTROLADOR: 'controlador',
  APONTADOR: 'apontador',
} as const

// Status de equipamento
export const EQUIPAMENTO_STATUS = {
  DISPONIVEL: 'disponivel',
  EM_USO: 'em_uso',
  MANUTENCAO: 'manutencao',
  INATIVO: 'inativo',
} as const

// Tipos de manutenção
export const MANUTENCAO_TIPOS = {
  PREVENTIVA: 'preventiva',
  CORRETIVA: 'corretiva',
  PREDITIVA: 'preditiva',
} as const

// Prioridades
export const PRIORIDADES = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica',
} as const

// Status de obra
export const OBRA_STATUS = {
  ATIVA: 'ativa',
  PARALISADA: 'paralisada',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
} as const

// Status de pagamento
export const PAGAMENTO_STATUS = {
  PENDENTE: 'pendente',
  PAGO: 'pago',
  ATRASADO: 'atrasado',
  CANCELADO: 'cancelado',
} as const

// Formas de pagamento
export const FORMAS_PAGAMENTO = {
  CARTAO: 'cartao',
  PIX: 'pix',
  BOLETO: 'boleto',
} as const

// Tipos de plano
export const PLANO_TIPOS = {
  START: 'Start',
  GROWTH: 'Growth',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
} as const

// Períodos
export const PERIODOS = {
  HOJE: 'hoje',
  ONTEM: 'ontem',
  ULTIMOS_7_DIAS: '7d',
  ULTIMOS_30_DIAS: '30d',
  ULTIMOS_90_DIAS: '90d',
  ESTE_MES: 'este_mes',
  MES_PASSADO: 'mes_passado',
  ESTE_ANO: 'este_ano',
  ANO_PASSADO: 'ano_passado',
  TODOS: 'todos',
} as const

// Unidades de medida
export const UNIDADES = {
  UNIDADE: 'un',
  METRO: 'm',
  METRO_QUADRADO: 'm²',
  METRO_CUBICO: 'm³',
  QUILOGRAMA: 'kg',
  TONELADA: 'ton',
  HORA: 'h',
  DIA: 'd',
  MES: 'mes',
} as const

// Categorias de custo
export const CATEGORIAS_CUSTO = {
  COMBUSTIVEL: 'combustivel',
  MANUTENCAO: 'manutencao',
  PECAS: 'pecas',
  MAO_DE_OBRA: 'mao_de_obra',
  DEPRECIACAO: 'depreciacao',
  SEGURO: 'seguro',
  IMPOSTOS: 'impostos',
  OUTROS: 'outros',
} as const

// Tipos de relatório
export const RELATORIO_TIPOS = {
  EXECUTIVO: 'executivo',
  OPERACIONAL: 'operacional',
  FINANCEIRO: 'financeiro',
  MANUTENCAO: 'manutencao',
  EQUIPAMENTOS: 'equipamentos',
  OBRAS: 'obras',
  USUARIOS: 'usuarios',
  PERSONALIZADO: 'personalizado',
} as const

// Formatos de arquivo
export const FORMATOS_ARQUIVO = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  HTML: 'html',
} as const

// Frequências de agendamento
export const FREQUENCIAS = {
  DIARIO: 'diario',
  SEMANAL: 'semanal',
  MENSAL: 'mensal',
  TRIMESTRAL: 'trimestral',
  SEMESTRAL: 'semestral',
  ANUAL: 'anual',
} as const

// Limites padrão
export const LIMITES_PADRAO = {
  ADM: 1,
  CONTROLADOR: 2,
  APONTADOR: 2,
  EQUIPAMENTOS: 25,
} as const

// Valores padrão
export const VALORES_PADRAO = {
  IMPLANTACAO: 3000,
  MENSALIDADE_START: 750,
  MENSALIDADE_GROWTH: 1400,
  MENSALIDADE_PRO: 2080,
  MENSALIDADE_ENTERPRISE: 3600,
} as const

// Dias padrão
export const DIAS_PADRAO = {
  TOLERANCIA_ATRASO: 10,
  IMPLANTACAO: 10,
  PRIMEIRA_MENSALIDADE: 40,
} as const

// Mensagens de erro
export const ERROR_MESSAGES = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'E-mail inválido',
  INVALID_CPF: 'CPF inválido',
  INVALID_CNPJ: 'CNPJ inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_CEP: 'CEP inválido',
  PASSWORD_MISMATCH: 'As senhas não conferem',
  PASSWORD_MIN_LENGTH: 'A senha deve ter no mínimo 6 caracteres',
  PASSWORD_WEAK: 'A senha deve conter letras maiúsculas, minúsculas e números',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Não encontrado',
  SERVER_ERROR: 'Erro interno do servidor',
  NETWORK_ERROR: 'Erro de conexão',
  TIMEOUT: 'Tempo limite excedido',
} as const

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Excluído com sucesso',
  SAVED: 'Salvo com sucesso',
  SENT: 'Enviado com sucesso',
  APPROVED: 'Aprovado com sucesso',
  REJECTED: 'Rejeitado com sucesso',
  COMPLETED: 'Concluído com sucesso',
  CANCELED: 'Cancelado com sucesso',
  LOGIN: 'Login realizado com sucesso',
  LOGOUT: 'Logout realizado com sucesso',
  PASSWORD_CHANGED: 'Senha alterada com sucesso',
  EMAIL_SENT: 'E-mail enviado com sucesso',
} as const

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50, 100],
  MAX_LIMIT: 1000,
} as const

// Configurações de upload
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const

// Cores dos status
export const STATUS_COLORS = {
  [STATUS.ATIVO]: 'bg-green-100 text-green-800',
  [STATUS.INATIVO]: 'bg-gray-100 text-gray-800',
  [STATUS.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [STATUS.CANCELADO]: 'bg-red-100 text-red-800',
  [STATUS.CONCLUIDO]: 'bg-green-100 text-green-800',
  [STATUS.APROVADO]: 'bg-green-100 text-green-800',
  [STATUS.REJEITADO]: 'bg-red-100 text-red-800',
  [STATUS.EM_ANDAMENTO]: 'bg-blue-100 text-blue-800',
  [STATUS.PROGRAMADO]: 'bg-purple-100 text-purple-800',
  [STATUS.ATRASADO]: 'bg-red-100 text-red-800',
} as const

// Ícones dos status
export const STATUS_ICONS = {
  [STATUS.ATIVO]: '✓',
  [STATUS.INATIVO]: '○',
  [STATUS.PENDENTE]: '⏳',
  [STATUS.CANCELADO]: '✗',
  [STATUS.CONCLUIDO]: '✓',
  [STATUS.APROVADO]: '✓',
  [STATUS.REJEITADO]: '✗',
  [STATUS.EM_ANDAMENTO]: '⚙️',
  [STATUS.PROGRAMADO]: '📅',
  [STATUS.ATRASADO]: '⚠️',
} as const

// Rotas públicas
export const PUBLIC_ROUTES = [
  '/',
  '/planos',
  '/blog',
  '/blog/(.*)',
  '/juridico',
  '/juridico/(.*)',
  '/login',
  '/esqueci-senha',
  '/resetar-senha/(.*)',
] as const

// Rotas de admin
export const ADMIN_ROUTES = [
  '/admin-sistema',
  '/admin-sistema/(.*)',
] as const

// Rotas da empresa
export const EMPRESA_ROUTES = [
  '/app-empresa',
  '/app-empresa/(.*)',
] as const