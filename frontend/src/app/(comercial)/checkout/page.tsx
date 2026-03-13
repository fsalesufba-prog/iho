'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CreditCard,
  QrCode,
  Barcode,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Shield,
  Clock,
  Calendar,
  DollarSign,
  Truck,
  Users,
  Package,
  Wrench,
  BarChart3,
  Activity,
  HelpCircle,
  Sparkles,
  Zap,
  Award,
  Target,
  Globe,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  ArrowRight,
  Home,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Tablet,
  Moon,
  Sun,
  Monitor,
  Bell,
  Settings,
  LogOut,
  Menu,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,
  Upload,
  DownloadCloud,
  Share2,
  Heart,
  Bookmark,
  Star,
  Flag,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  Link2,
  Send,
  Reply,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Coffee,
  Gift,
  Award as AwardIcon,
  Crown,
  Rocket,
  Plane,
  Ship,
  Train,
  Car,
  Bike,
  Bus,
  Taxi,
  Truck as TruckIcon,
  Package as PackageIcon,
  Box,
  Archive,
  Folder,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Printer as PrinterIcon,
  Monitor as MonitorIcon,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  Smartphone as SmartphoneIcon,
  Watch,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Map,
  Compass,
  Navigation,
  Flag as FlagIcon,
  Tag,
  Tags,
  PriceTag,
  ShoppingBag,
  ShoppingCart,
  CreditCard as CreditCardIcon,
  DollarSign as DollarSignIcon,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  Percent,
  BadgePercent,
  BadgeIndianRupee,
  BadgeJapaneseYen,
  BadgePoundSterling,
  BadgeSwissFranc,
  BadgeEuro,
  BadgeDollarSign,
  BadgeCent,
  BadgeRussianRuble,
  BadgeKoreanWon,
  BadgeChineseYuan,
  BadgeTurkishLira,
  BadgeIsraeliShekel,
  BadgeArgentinianPeso,
  BadgeBrazilianReal,
  BadgeColombianPeso,
  BadgeMexicanPeso,
  BadgePeruvianSol,
  BadgeChileanPeso,
  BadgeUruguayanPeso,
  BadgeParaguayanGuarani,
  BadgeBolivianBoliviano,
  BadgeVenezuelanBolivar,
  BadgeCostaRicanColon,
  BadgeDominicanPeso,
  BadgeEcuadorianDollar,
  BadgeGuatemalanQuetzal,
  BadgeHonduranLempira,
  BadgeNicaraguanCordoba,
  BadgePanamanianBalboa,
  BadgeSalvadoranDollar,
  BadgeTrinidadTobagoDollar,
  BadgeJamaicanDollar,
  BadgeBahamianDollar,
  BadgeBarbadianDollar,
  BadgeBelizeDollar,
  BadgeBermudianDollar,
  BadgeCaymanIslandsDollar,
  BadgeEastCaribbeanDollar,
  BadgeFijiDollar,
  BadgeGuyaneseDollar,
  BadgeHaitianGourde,
  BadgeSurinameseDollar,
  BadgeAngolanKwanza,
  BadgeBotswanaPula,
  BadgeBurundianFranc,
  BadgeCapeVerdeanEscudo,
  BadgeComorianFranc,
  BadgeCongoleseFranc,
  BadgeDjiboutianFranc,
  BadgeEgyptianPound,
  BadgeEritreanNakfa,
  BadgeEswatiniLilangeni,
  BadgeEthiopianBirr,
  BadgeGambianDalasi,
  BadgeGhanaianCedi,
  BadgeGuineanFranc,
  BadgeKenyanShilling,
  BadgeLesothoLoti,
  BadgeLiberianDollar,
  BadgeLibyanDinar,
  BadgeMalagasyAriary,
  BadgeMalawianKwacha,
  BadgeMauritanianOuguiya,
  BadgeMauritianRupee,
  BadgeMoroccanDirham,
  BadgeMozambicanMetical,
  BadgeNamibianDollar,
  BadgeNigerianNaira,
  BadgeRwandanFranc,
  BadgeSaoTomeDobra,
  BadgeSeychelloisRupee,
  BadgeSierraLeoneanLeone,
  BadgeSomaliShilling,
  BadgeSouthAfricanRand,
  BadgeSouthSudanesePound,
  BadgeSudanesePound,
  BadgeTanzanianShilling,
  BadgeTonganPaanga,
  BadgeTunisianDinar,
  BadgeUgandanShilling,
  BadgeZambianKwacha,
  BadgeZimbabweanDollar,
  BadgeArmenianDram,
  BadgeAzerbaijaniManat,
  BadgeBahrainiDinar,
  BadgeBangladeshiTaka,
  BadgeBhutaneseNgultrum,
  BadgeBruneiDollar,
  BadgeCambodianRiel,
  BadgeGeorgianLari,
  BadgeHongKongDollar,
  BadgeIndonesianRupiah,
  BadgeIranianRial,
  BadgeIraqiDinar,
  BadgeJordanianDinar,
  BadgeKazakhstaniTenge,
  BadgeKuwaitiDinar,
  BadgeKyrgyzstaniSom,
  BadgeLaoKip,
  BadgeLebanesePound,
  BadgeMacanesePataca,
  BadgeMalaysianRinggit,
  BadgeMaldivianRufiyaa,
  BadgeMongolianTugrik,
  BadgeMyanmarKyat,
  BadgeNepaleseRupee,
  BadgeNorthKoreanWon,
  BadgeOmaniRial,
  BadgePakistaniRupee,
  BadgePhilippinePeso,
  BadgeQatariRiyal,
  BadgeSaudiRiyal,
  BadgeSingaporeDollar,
  BadgeSouthKoreanWon,
  BadgeSriLankanRupee,
  BadgeSyrianPound,
  BadgeTaiwanDollar,
  BadgeTajikistaniSomoni,
  BadgeThaiBaht,
  BadgeTurkmenistaniManat,
  BadgeUnitedArabEmiratesDirham,
  BadgeUzbekistaniSom,
  BadgeVietnameseDong,
  BadgeYemeniRial,
  BadgeAfghanAfghani,
  BadgeAlbanianLek,
  BadgeBosniaHerzegovinaConvertibleMark,
  BadgeBulgarianLev,
  BadgeCroatianKuna,
  BadgeCzechKoruna,
  BadgeDanishKrone,
  BadgeHungarianForint,
  BadgeIcelandicKrona,
  BadgeMacedonianDenar,
  BadgeMoldovanLeu,
  BadgeNorwegianKrone,
  BadgePolishZloty,
  BadgeRomanianLeu,
  BadgeSerbianDinar,
  BadgeSwedishKrona,
  BadgeUkrainianHryvnia,
  BadgeBritishPound,
  BadgeYen,
  BadgeWon,
  BadgeFranc,
  BadgeLira,
  BadgeRuble,
  BadgeRupee,
  BadgeRinggit,
  BadgeBaht,
  BadgeDong,
  BadgeKip,
  BadgeTugrik,
  BadgeRiel,
  BadgeKyat,
  BadgeLari,
  BadgeSom,
  BadgeManat,
  BadgeDram,
  BadgeTenge,
  BadgeSomoni,
  BadgeLeu,
  BadgeLev,
  BadgeKuna,
  BadgeDenar,
  BadgeForint,
  BadgeKrone,
  BadgeKrona,
  BadgeZloty,
  BadgeHryvnia,
  BadgeLek,
  BadgeMark,
  BadgeConvertibleMark
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Progress } from '@/components/ui/Progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'
import { validators } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface Plano {
  id: number
  nome: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
  recursos: string[]
}

interface DadosEmpresa {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  numero: string
  complemento?: string
  bairro: string
}

interface DadosResponsavel {
  nome: string
  email: string
  telefone: string
  cpf: string
  cargo: string
}

interface DadosPagamento {
  metodo: 'cartao' | 'pix' | 'boleto' | null
  parcelas: number
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
  cardCpf?: string
  cardInstallments?: number
  saveCard?: boolean
}

type Etapa = 'plano' | 'empresa' | 'responsavel' | 'pagamento' | 'confirmacao'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [etapa, setEtapa] = useState<Etapa>('plano')
  const [plano, setPlano] = useState<Plano | null>(null)
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [termos, setTermos] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [showPixForm, setShowPixForm] = useState(false)
  const [showBoletoForm, setShowBoletoForm] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [pagamentoId, setPagamentoId] = useState<number | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [codigoPix, setCodigoPix] = useState<string | null>(null)
  const [linhaDigitavel, setLinhaDigitavel] = useState<string | null>(null)
  const [urlBoleto, setUrlBoleto] = useState<string | null>(null)
  const [tempoRestante, setTempoRestante] = useState<string>('30:00')

  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    numero: '',
    complemento: '',
    bairro: ''
  })

  const [dadosResponsavel, setDadosResponsavel] = useState<DadosResponsavel>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    cargo: ''
  })

  const [dadosPagamento, setDadosPagamento] = useState<DadosPagamento>({
    metodo: null,
    parcelas: 1,
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    cardCpf: '',
    cardInstallments: 1,
    saveCard: false
  })

  useEffect(() => {
    carregarPlanos()

    const planoId = searchParams.get('plano')
    if (planoId) {
      selecionarPlano(parseInt(planoId))
    }
  }, [searchParams])

  useEffect(() => {
    if (pagamentoId && dadosPagamento.metodo === 'pix') {
      const timer = setInterval(() => {
        verificarStatusPagamento()
      }, 5000)

      return () => clearInterval(timer)
    }
  }, [pagamentoId, dadosPagamento.metodo])

  useEffect(() => {
    if (dadosPagamento.metodo === 'pix' && pagamentoId) {
      const interval = setInterval(() => {
        const agora = new Date()
        const vencimento = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
        const diff = vencimento.getTime() - agora.getTime()

        if (diff <= 0) {
          setTempoRestante('Expirado')
          clearInterval(interval)
          return
        }

        const minutos = Math.floor(diff / (1000 * 60))
        const segundos = Math.floor((diff % (1000 * 60)) / 1000)
        setTempoRestante(`${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [dadosPagamento.metodo, pagamentoId])

  const carregarPlanos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/planos', { params: { ativos: true, limit: 100 } })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selecionarPlano = (id: number) => {
    const planoSelecionado = planos.find(p => p.id === id)
    if (planoSelecionado) {
      setPlano(planoSelecionado)
      setEtapa('empresa')
    }
  }

  const validarEmpresa = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!dadosEmpresa.nome) novosErros.nome = 'Nome da empresa é obrigatório'
    if (!dadosEmpresa.cnpj) novosErros.cnpj = 'CNPJ é obrigatório'
    else if (!validators.cnpj(dadosEmpresa.cnpj)) novosErros.cnpj = 'CNPJ inválido'
    
    if (!dadosEmpresa.email) novosErros.email = 'E-mail é obrigatório'
    else if (!validators.email(dadosEmpresa.email)) novosErros.email = 'E-mail inválido'
    
    if (!dadosEmpresa.telefone) novosErros.telefone = 'Telefone é obrigatório'
    else if (!validators.phone(dadosEmpresa.telefone)) novosErros.telefone = 'Telefone inválido'
    
    if (!dadosEmpresa.endereco) novosErros.endereco = 'Endereço é obrigatório'
    if (!dadosEmpresa.cidade) novosErros.cidade = 'Cidade é obrigatória'
    if (!dadosEmpresa.estado) novosErros.estado = 'Estado é obrigatório'
    if (!dadosEmpresa.cep) novosErros.cep = 'CEP é obrigatório'
    else if (!validators.cep(dadosEmpresa.cep)) novosErros.cep = 'CEP inválido'
    if (!dadosEmpresa.numero) novosErros.numero = 'Número é obrigatório'
    if (!dadosEmpresa.bairro) novosErros.bairro = 'Bairro é obrigatório'

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const validarResponsavel = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!dadosResponsavel.nome) novosErros.nome = 'Nome é obrigatório'
    if (!dadosResponsavel.email) novosErros.email = 'E-mail é obrigatório'
    else if (!validators.email(dadosResponsavel.email)) novosErros.email = 'E-mail inválido'
    
    if (!dadosResponsavel.telefone) novosErros.telefone = 'Telefone é obrigatório'
    else if (!validators.phone(dadosResponsavel.telefone)) novosErros.telefone = 'Telefone inválido'
    
    if (!dadosResponsavel.cpf) novosErros.cpf = 'CPF é obrigatório'
    else if (!validators.cpf(dadosResponsavel.cpf)) novosErros.cpf = 'CPF inválido'
    
    if (!dadosResponsavel.cargo) novosErros.cargo = 'Cargo é obrigatório'

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const validarPagamento = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!dadosPagamento.metodo) novosErros.metodo = 'Selecione um método de pagamento'

    if (dadosPagamento.metodo === 'cartao') {
      if (!dadosPagamento.cardNumber) novosErros.cardNumber = 'Número do cartão é obrigatório'
      else if (dadosPagamento.cardNumber.replace(/\s/g, '').length < 16) {
        novosErros.cardNumber = 'Número do cartão inválido'
      }

      if (!dadosPagamento.cardName) novosErros.cardName = 'Nome do titular é obrigatório'
      if (!dadosPagamento.cardExpiry) novosErros.cardExpiry = 'Data de validade é obrigatória'
      else if (!/^\d{2}\/\d{2}$/.test(dadosPagamento.cardExpiry)) {
        novosErros.cardExpiry = 'Data inválida (MM/AA)'
      }

      if (!dadosPagamento.cardCvv) novosErros.cardCvv = 'CVV é obrigatório'
      else if (dadosPagamento.cardCvv.length < 3) novosErros.cardCvv = 'CVV inválido'

      if (!dadosPagamento.cardCpf) novosErros.cardCpf = 'CPF é obrigatório'
      else if (!validators.cpf(dadosPagamento.cardCpf)) novosErros.cardCpf = 'CPF inválido'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleProximo = () => {
    let valido = false

    switch (etapa) {
      case 'plano':
        if (plano) {
          setEtapa('empresa')
        } else {
          toast({
            title: 'Atenção',
            description: 'Selecione um plano para continuar',
            variant: 'destructive'
          })
        }
        break

      case 'empresa':
        if (validarEmpresa()) {
          setEtapa('responsavel')
        }
        break

      case 'responsavel':
        if (validarResponsavel()) {
          setEtapa('pagamento')
        }
        break

      case 'pagamento':
        if (validarPagamento()) {
          setShowConfirmDialog(true)
        }
        break
    }
  }

  const handleVoltar = () => {
    switch (etapa) {
      case 'empresa':
        setEtapa('plano')
        break
      case 'responsavel':
        setEtapa('empresa')
        break
      case 'pagamento':
        setEtapa('responsavel')
        break
      case 'confirmacao':
        setEtapa('pagamento')
        break
    }
  }

  const handleConfirmar = async () => {
    if (!termos) {
      toast({
        title: 'Atenção',
        description: 'Você precisa aceitar os termos de uso',
        variant: 'destructive'
      })
      return
    }

    setProcessing(true)
    setShowConfirmDialog(false)

    try {
      const response = await api.post('/pagamentos/comercial/iniciar', {
        planoId: plano?.id,
        metodo: dadosPagamento.metodo,
        parcelas: dadosPagamento.parcelas,
        dadosEmpresa,
        dadosResponsavel,
        dadosPagamento: dadosPagamento.metodo === 'cartao' ? {
          cardNumber: dadosPagamento.cardNumber?.replace(/\s/g, ''),
          cardName: dadosPagamento.cardName,
          cardExpiry: dadosPagamento.cardExpiry,
          cardCvv: dadosPagamento.cardCvv,
          cardCpf: dadosPagamento.cardCpf,
          cardInstallments: dadosPagamento.cardInstallments,
          saveCard: dadosPagamento.saveCard
        } : undefined
      })

      setPagamentoId(response.data.dados.id)

      if (dadosPagamento.metodo === 'pix') {
        setQrCode(response.data.dados.qrCode)
        setCodigoPix(response.data.dados.codigoPix)
        setShowPixForm(true)
      } else if (dadosPagamento.metodo === 'boleto') {
        setLinhaDigitavel(response.data.dados.linhaDigitavel)
        setUrlBoleto(response.data.dados.urlBoleto)
        setShowBoletoForm(true)
      } else {
        setShowSuccessDialog(true)
      }

      toast({
        title: 'Sucesso!',
        description: 'Pagamento iniciado com sucesso. Siga as instruções para concluir.'
      })

      if (newsletter) {
        await api.post('/newsletter/subscribe', {
          email: dadosResponsavel.email,
          nome: dadosResponsavel.nome
        }).catch(() => {})
      }

    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível processar o pagamento',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const verificarStatusPagamento = async () => {
    if (!pagamentoId) return

    try {
      const response = await api.get(`/pagamentos/comercial/${pagamentoId}/status`)
      if (response.data.status === 'pago') {
        setShowPixForm(false)
        setShowBoletoForm(false)
        setShowSuccessDialog(true)
        toast({
          title: 'Pagamento confirmado!',
          description: 'Seu pagamento foi processado com sucesso.'
        })
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const handleCopyPix = () => {
    if (codigoPix) {
      navigator.clipboard.writeText(codigoPix)
      setCopied(true)
      toast({
        title: 'Copiado!',
        description: 'Código PIX copiado para a área de transferência'
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calcularTotal = () => {
    if (!plano) return 0
    let total = plano.valorImplantacao
    if (dadosPagamento.metodo === 'pix') {
      total = total * 0.95 // 5% de desconto
    }
    return total
  }

  const etapas = [
    { id: 'plano', label: 'Plano', icon: <Target className="h-4 w-4" /> },
    { id: 'empresa', label: 'Empresa', icon: <Building2 className="h-4 w-4" /> },
    { id: 'responsavel', label: 'Responsável', icon: <User className="h-4 w-4" /> },
    { id: 'pagamento', label: 'Pagamento', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'confirmacao', label: 'Confirmação', icon: <CheckCircle className="h-4 w-4" /> }
  ]

  const indiceEtapa = etapas.findIndex(e => e.id === etapa)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/planos" className="hover:text-primary transition-colors">
              Planos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Checkout</span>
          </div>

          {/* Progresso */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {etapas.map((e, i) => (
                <div key={e.id} className="flex items-center flex-1 last:flex-none">
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      i <= indiceEtapa
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {i < indiceEtapa ? <CheckCircle className="h-5 w-5" /> : e.icon}
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                      {e.label}
                    </span>
                  </div>
                  {i < etapas.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-2 transition-all duration-300",
                      i < indiceEtapa ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {/* Seleção de Plano */}
                {etapa === 'plano' && (
                  <motion.div
                    key="plano"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-6">Escolha seu plano</h2>

                        {loading ? (
                          <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {planos.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => selecionarPlano(p.id)}
                                className={cn(
                                  "relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg",
                                  plano?.id === p.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {p.nome === 'Growth' && (
                                  <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-primary to-accent text-white">
                                    Mais Popular
                                  </Badge>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-xl font-bold">{p.nome}</h3>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold text-primary">
                                      {formatCurrency(p.valorMensal)}
                                    </span>
                                    <span className="text-muted-foreground">/mês</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span>1 ADM + {p.limiteControlador} Controles + {p.limiteApontador} Apont</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Truck className="h-4 w-4 text-primary" />
                                    <span>Até {p.limiteEquipamentos} equipamentos</span>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  Taxa única de implantação: {formatCurrency(p.valorImplantacao)}
                                </p>

                                {plano?.id === p.id && (
                                  <div className="absolute top-4 right-4">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Dados da Empresa */}
                {etapa === 'empresa' && (
                  <motion.div
                    key="empresa"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-6">Dados da Empresa</h2>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nome">Nome da Empresa</Label>
                              <Input
                                id="nome"
                                value={dadosEmpresa.nome}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                                placeholder="Razão Social"
                                className={erros.nome ? 'border-destructive' : ''}
                              />
                              {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
                            </div>

                            <div>
                              <Label htmlFor="cnpj">CNPJ</Label>
                              <Input
                                id="cnpj"
                                value={dadosEmpresa.cnpj}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, cnpj: masks.cnpj(e.target.value)})}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                                className={erros.cnpj ? 'border-destructive' : ''}
                              />
                              {erros.cnpj && <p className="text-xs text-destructive mt-1">{erros.cnpj}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">E-mail</Label>
                              <Input
                                id="email"
                                type="email"
                                value={dadosEmpresa.email}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, email: e.target.value})}
                                placeholder="contato@empresa.com"
                                className={erros.email ? 'border-destructive' : ''}
                              />
                              {erros.email && <p className="text-xs text-destructive mt-1">{erros.email}</p>}
                            </div>

                            <div>
                              <Label htmlFor="telefone">Telefone</Label>
                              <Input
                                id="telefone"
                                value={dadosEmpresa.telefone}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, telefone: masks.phone(e.target.value)})}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                className={erros.telefone ? 'border-destructive' : ''}
                              />
                              {erros.telefone && <p className="text-xs text-destructive mt-1">{erros.telefone}</p>}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                              id="endereco"
                              value={dadosEmpresa.endereco}
                              onChange={(e) => setDadosEmpresa({...dadosEmpresa, endereco: e.target.value})}
                              placeholder="Rua, Avenida..."
                              className={erros.endereco ? 'border-destructive' : ''}
                            />
                            {erros.endereco && <p className="text-xs text-destructive mt-1">{erros.endereco}</p>}
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="numero">Número</Label>
                              <Input
                                id="numero"
                                value={dadosEmpresa.numero}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, numero: e.target.value})}
                                placeholder="123"
                                className={erros.numero ? 'border-destructive' : ''}
                              />
                              {erros.numero && <p className="text-xs text-destructive mt-1">{erros.numero}</p>}
                            </div>

                            <div className="col-span-2">
                              <Label htmlFor="complemento">Complemento</Label>
                              <Input
                                id="complemento"
                                value={dadosEmpresa.complemento}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, complemento: e.target.value})}
                                placeholder="Sala, Andar..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="bairro">Bairro</Label>
                              <Input
                                id="bairro"
                                value={dadosEmpresa.bairro}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, bairro: e.target.value})}
                                placeholder="Centro"
                                className={erros.bairro ? 'border-destructive' : ''}
                              />
                              {erros.bairro && <p className="text-xs text-destructive mt-1">{erros.bairro}</p>}
                            </div>

                            <div>
                              <Label htmlFor="cidade">Cidade</Label>
                              <Input
                                id="cidade"
                                value={dadosEmpresa.cidade}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, cidade: e.target.value})}
                                placeholder="São Paulo"
                                className={erros.cidade ? 'border-destructive' : ''}
                              />
                              {erros.cidade && <p className="text-xs text-destructive mt-1">{erros.cidade}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="estado">Estado</Label>
                              <Select
                                value={dadosEmpresa.estado}
                                onValueChange={(value) => setDadosEmpresa({...dadosEmpresa, estado: value})}
                              >
                                <SelectTrigger className={erros.estado ? 'border-destructive' : ''}>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AC">Acre</SelectItem>
                                  <SelectItem value="AL">Alagoas</SelectItem>
                                  <SelectItem value="AP">Amapá</SelectItem>
                                  <SelectItem value="AM">Amazonas</SelectItem>
                                  <SelectItem value="BA">Bahia</SelectItem>
                                  <SelectItem value="CE">Ceará</SelectItem>
                                  <SelectItem value="DF">Distrito Federal</SelectItem>
                                  <SelectItem value="ES">Espírito Santo</SelectItem>
                                  <SelectItem value="GO">Goiás</SelectItem>
                                  <SelectItem value="MA">Maranhão</SelectItem>
                                  <SelectItem value="MT">Mato Grosso</SelectItem>
                                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                  <SelectItem value="MG">Minas Gerais</SelectItem>
                                  <SelectItem value="PA">Pará</SelectItem>
                                  <SelectItem value="PB">Paraíba</SelectItem>
                                  <SelectItem value="PR">Paraná</SelectItem>
                                  <SelectItem value="PE">Pernambuco</SelectItem>
                                  <SelectItem value="PI">Piauí</SelectItem>
                                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                  <SelectItem value="RO">Rondônia</SelectItem>
                                  <SelectItem value="RR">Roraima</SelectItem>
                                  <SelectItem value="SC">Santa Catarina</SelectItem>
                                  <SelectItem value="SP">São Paulo</SelectItem>
                                  <SelectItem value="SE">Sergipe</SelectItem>
                                  <SelectItem value="TO">Tocantins</SelectItem>
                                </SelectContent>
                              </Select>
                              {erros.estado && <p className="text-xs text-destructive mt-1">{erros.estado}</p>}
                            </div>

                            <div>
                              <Label htmlFor="cep">CEP</Label>
                              <Input
                                id="cep"
                                value={dadosEmpresa.cep}
                                onChange={(e) => setDadosEmpresa({...dadosEmpresa, cep: masks.cep(e.target.value)})}
                                placeholder="00000-000"
                                maxLength={9}
                                className={erros.cep ? 'border-destructive' : ''}
                              />
                              {erros.cep && <p className="text-xs text-destructive mt-1">{erros.cep}</p>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Dados do Responsável */}
                {etapa === 'responsavel' && (
                  <motion.div
                    key="responsavel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-6">Dados do Responsável</h2>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="resp-nome">Nome Completo</Label>
                            <Input
                              id="resp-nome"
                              value={dadosResponsavel.nome}
                              onChange={(e) => setDadosResponsavel({...dadosResponsavel, nome: e.target.value})}
                              placeholder="Nome do responsável"
                              className={erros.nome ? 'border-destructive' : ''}
                            />
                            {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="resp-email">E-mail</Label>
                              <Input
                                id="resp-email"
                                type="email"
                                value={dadosResponsavel.email}
                                onChange={(e) => setDadosResponsavel({...dadosResponsavel, email: e.target.value})}
                                placeholder="responsavel@email.com"
                                className={erros.email ? 'border-destructive' : ''}
                              />
                              {erros.email && <p className="text-xs text-destructive mt-1">{erros.email}</p>}
                            </div>

                            <div>
                              <Label htmlFor="resp-telefone">Telefone</Label>
                              <Input
                                id="resp-telefone"
                                value={dadosResponsavel.telefone}
                                onChange={(e) => setDadosResponsavel({...dadosResponsavel, telefone: masks.phone(e.target.value)})}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                className={erros.telefone ? 'border-destructive' : ''}
                              />
                              {erros.telefone && <p className="text-xs text-destructive mt-1">{erros.telefone}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="resp-cpf">CPF</Label>
                              <Input
                                id="resp-cpf"
                                value={dadosResponsavel.cpf}
                                onChange={(e) => setDadosResponsavel({...dadosResponsavel, cpf: masks.cpf(e.target.value)})}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={erros.cpf ? 'border-destructive' : ''}
                              />
                              {erros.cpf && <p className="text-xs text-destructive mt-1">{erros.cpf}</p>}
                            </div>

                            <div>
                              <Label htmlFor="resp-cargo">Cargo</Label>
                              <Input
                                id="resp-cargo"
                                value={dadosResponsavel.cargo}
                                onChange={(e) => setDadosResponsavel({...dadosResponsavel, cargo: e.target.value})}
                                placeholder="Diretor, Gerente..."
                                className={erros.cargo ? 'border-destructive' : ''}
                              />
                              {erros.cargo && <p className="text-xs text-destructive mt-1">{erros.cargo}</p>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Pagamento */}
                {etapa === 'pagamento' && (
                  <motion.div
                    key="pagamento"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-semibold mb-6">Forma de Pagamento</h2>

                        <RadioGroup
                          value={dadosPagamento.metodo || ''}
                          onValueChange={(value: any) => setDadosPagamento({...dadosPagamento, metodo: value})}
                          className="grid gap-4 mb-6"
                        >
                          <div>
                            <RadioGroupItem value="cartao" id="cartao" className="peer sr-only" />
                            <Label
                              htmlFor="cartao"
                              className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <CreditCard className="h-6 w-6" />
                              <div className="flex-1">
                                <p className="font-medium">Cartão de Crédito</p>
                                <p className="text-sm text-muted-foreground">
                                  Parcele em até 10x sem juros
                                </p>
                              </div>
                            </Label>
                          </div>

                          <div>
                            <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                            <Label
                              htmlFor="pix"
                              className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <QrCode className="h-6 w-6" />
                              <div className="flex-1">
                                <p className="font-medium">PIX</p>
                                <p className="text-sm text-muted-foreground">
                                  Pagamento instantâneo com 5% de desconto
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">5% OFF</Badge>
                            </Label>
                          </div>

                          <div>
                            <RadioGroupItem value="boleto" id="boleto" className="peer sr-only" />
                            <Label
                              htmlFor="boleto"
                              className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <Barcode className="h-6 w-6" />
                              <div className="flex-1">
                                <p className="font-medium">Boleto Bancário</p>
                                <p className="text-sm text-muted-foreground">
                                  Pagamento em até 3 dias úteis
                                </p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>

                        {dadosPagamento.metodo === 'cartao' && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Dados do Cartão</h3>

                            <div>
                              <Label htmlFor="card-number">Número do Cartão</Label>
                              <Input
                                id="card-number"
                                value={dadosPagamento.cardNumber}
                                onChange={(e) => setDadosPagamento({
                                  ...dadosPagamento,
                                  cardNumber: e.target.value
                                    .replace(/\D/g, '')
                                    .replace(/(\d{4})(?=\d)/g, '$1 ')
                                    .slice(0, 19)
                                })}
                                placeholder="0000 0000 0000 0000"
                                className={erros.cardNumber ? 'border-destructive' : ''}
                              />
                              {erros.cardNumber && <p className="text-xs text-destructive mt-1">{erros.cardNumber}</p>}
                            </div>

                            <div>
                              <Label htmlFor="card-name">Nome do Titular</Label>
                              <Input
                                id="card-name"
                                value={dadosPagamento.cardName}
                                onChange={(e) => setDadosPagamento({...dadosPagamento, cardName: e.target.value})}
                                placeholder="Como no cartão"
                                className={erros.cardName ? 'border-destructive' : ''}
                              />
                              {erros.cardName && <p className="text-xs text-destructive mt-1">{erros.cardName}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="card-expiry">Validade</Label>
                                <Input
                                  id="card-expiry"
                                  value={dadosPagamento.cardExpiry}
                                  onChange={(e) => setDadosPagamento({
                                    ...dadosPagamento,
                                    cardExpiry: e.target.value
                                      .replace(/\D/g, '')
                                      .replace(/(\d{2})(\d)/, '$1/$2')
                                      .slice(0, 5)
                                  })}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  className={erros.cardExpiry ? 'border-destructive' : ''}
                                />
                                {erros.cardExpiry && <p className="text-xs text-destructive mt-1">{erros.cardExpiry}</p>}
                              </div>

                              <div>
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Input
                                  id="card-cvv"
                                  type="password"
                                  value={dadosPagamento.cardCvv}
                                  onChange={(e) => setDadosPagamento({
                                    ...dadosPagamento,
                                    cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                                  })}
                                  placeholder="123"
                                  maxLength={4}
                                  className={erros.cardCvv ? 'border-destructive' : ''}
                                />
                                {erros.cardCvv && <p className="text-xs text-destructive mt-1">{erros.cardCvv}</p>}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="card-cpf">CPF do Titular</Label>
                              <Input
                                id="card-cpf"
                                value={dadosPagamento.cardCpf}
                                onChange={(e) => setDadosPagamento({
                                  ...dadosPagamento,
                                  cardCpf: masks.cpf(e.target.value)
                                })}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={erros.cardCpf ? 'border-destructive' : ''}
                              />
                              {erros.cardCpf && <p className="text-xs text-destructive mt-1">{erros.cardCpf}</p>}
                            </div>

                            <div>
                              <Label htmlFor="installments">Número de parcelas</Label>
                              <Select
                                value={dadosPagamento.cardInstallments?.toString()}
                                onValueChange={(value) => setDadosPagamento({
                                  ...dadosPagamento,
                                  cardInstallments: parseInt(value)
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}x de {formatCurrency(calcularTotal() / num)} {num === 1 ? '(à vista)' : 'sem juros'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="save-card"
                                checked={dadosPagamento.saveCard}
                                onChange={(e) => setDadosPagamento({...dadosPagamento, saveCard: e.target.checked})}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="save-card" className="text-sm">
                                Salvar cartão para próximas compras
                              </Label>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botões de navegação */}
              <div className="flex justify-between">
                {etapa !== 'plano' && (
                  <Button variant="outline" onClick={handleVoltar}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                )}
                <div className="flex-1" />
                {etapa !== 'pagamento' ? (
                  <Button onClick={handleProximo}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleProximo} disabled={!dadosPagamento.metodo}>
                    Revisar pedido
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="bg-gradient-to-b from-card to-card/50 backdrop-blur">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>

                    {plano ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Plano</p>
                          <p className="font-medium text-lg">{plano.nome}</p>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Implantação</span>
                          <span className="font-medium">{formatCurrency(plano.valorImplantacao)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Mensalidade</span>
                          <span className="font-medium">{formatCurrency(plano.valorMensal)}/mês</span>
                        </div>

                        {dadosPagamento.metodo === 'pix' && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                              Desconto de 5% no PIX
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Total: {formatCurrency(calcularTotal())}
                            </p>
                          </div>
                        )}

                        <Separator />

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>1 ADM + {plano.limiteControlador} Controles + {plano.limiteApontador} Apont</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>Até {plano.limiteEquipamentos} equipamentos</span>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3 text-green-600" />
                            <span>Pagamento 100% seguro</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 text-primary" />
                            <span>Dados protegidos com criptografia</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 text-yellow-600" />
                            <span>Ativação em até 24h</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="termos"
                            checked={termos}
                            onChange={(e) => setTermos(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="termos" className="text-xs">
                            Li e aceito os{' '}
                            <Link href="/juridico/termos" className="text-primary hover:underline">
                              Termos de Uso
                            </Link>{' '}
                            e{' '}
                            <Link href="/juridico/privacidade" className="text-primary hover:underline">
                              Política de Privacidade
                            </Link>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="newsletter"
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="newsletter" className="text-xs">
                            Quero receber novidades e conteúdos exclusivos
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Selecione um plano para continuar
                      </p>
                    )}
                  </CardContent>
                </Card>


                {/* Precisa de ajuda? */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Precisa de ajuda?</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Fale com nossa equipe de vendas
                        </p>
                        <Link href="https://wa.me/55719982607352?text=Oi,%20quero%20falar%20sobre%20o%20IHO." className="text-xs text-primary hover:underline">
                          Falar com consultor →
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar pedido</DialogTitle>
            <DialogDescription>
              Revise as informações antes de finalizar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Plano</h4>
              <p className="text-sm">{plano?.nome}</p>
              <p className="text-sm text-muted-foreground">
                {plano && formatCurrency(plano.valorMensal)}/mês
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Empresa</h4>
              <p className="text-sm">{dadosEmpresa.nome}</p>
              <p className="text-sm text-muted-foreground">{dadosEmpresa.cnpj}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Responsável</h4>
              <p className="text-sm">{dadosResponsavel.nome}</p>
              <p className="text-sm text-muted-foreground">{dadosResponsavel.email}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Pagamento</h4>
              <p className="text-sm capitalize">{dadosPagamento.metodo}</p>
              <p className="text-sm font-bold text-primary">
                Total: {formatCurrency(calcularTotal())}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmar}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar pedido'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal PIX */}
      <Dialog open={showPixForm} onOpenChange={setShowPixForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código para pagar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">
                {formatCurrency(calcularTotal())}
              </p>
              <p className="text-sm text-muted-foreground">
                com 5% de desconto
              </p>
            </div>

            {qrCode && (
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            )}

            {codigoPix && (
              <div className="space-y-2">
                <Label>Código PIX Copia e Cola</Label>
                <div className="flex gap-2">
                  <Input
                    value={codigoPix}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPix}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Tempo restante
              </p>
              <p className={cn(
                "text-2xl font-mono font-bold",
                tempoRestante === 'Expirado' ? 'text-red-600' : 'text-orange-600'
              )}>
                {tempoRestante}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Instruções:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção PIX</li>
                <li>Leia o QR Code ou cole o código</li>
                <li>Confirme os dados e finalize</li>
              </ol>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowPixForm(false)
                setShowSuccessDialog(true)
              }}
            >
              Já realizei o pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Boleto */}
      <Dialog open={showBoletoForm} onOpenChange={setShowBoletoForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Boleto Bancário</DialogTitle>
            <DialogDescription>
              Pague o boleto em qualquer banco ou casa lotérica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">
                {formatCurrency(calcularTotal())}
              </p>
            </div>

            {linhaDigitavel && (
              <div className="space-y-2">
                <Label>Linha digitável</Label>
                <div className="flex gap-2">
                  <Input
                    value={linhaDigitavel}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(linhaDigitavel)
                      toast({ title: 'Copiado!', description: 'Linha digitável copiada' })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Instruções:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>O boleto pode ser pago em qualquer banco</li>
                <li>Pagamento pode levar até 3 dias úteis</li>
                <li>Após confirmação, enviaremos um e-mail</li>
              </ul>
            </div>

            <div className="flex gap-2">
              {urlBoleto && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(urlBoleto, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => {
                  setShowBoletoForm(false)
                  setShowSuccessDialog(true)
                }}
              >
                Já paguei
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pedido realizado com sucesso!</DialogTitle>
            <DialogDescription>
              {dadosPagamento.metodo === 'pix' || dadosPagamento.metodo === 'boleto'
                ? 'Aguardando confirmação do pagamento'
                : 'Seu pedido foi confirmado e o acesso já está liberado'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold mb-1">Obrigado pela compra!</p>
              <p className="text-sm text-muted-foreground">
                Enviamos um e-mail com todas as informações para {dadosResponsavel.email}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Resumo do pedido</p>
              <p className="text-sm">Plano: {plano?.nome}</p>
              <p className="text-sm">Empresa: {dadosEmpresa.nome}</p>
              <p className="text-sm font-bold text-primary">
                Total: {formatCurrency(calcularTotal())}
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Acessar sistema
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}