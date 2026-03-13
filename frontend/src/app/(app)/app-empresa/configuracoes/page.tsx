'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Settings,
  Building2,
  Users,
  Bell,
  CreditCard,
  ChevronRight,
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  status: string
  plano: {
    nome: string
    valorMensal: number
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
  }
  _count: {
    usuarios: number
    equipamentos: number
    obras: number
  }
}

interface Estatisticas {
  usuarios: number
  equipamentos: number
  obras: number
  manutencoes30dias: number
  percentualUsuarios: number
  percentualEquipamentos: number
}

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [empresaRes, statsRes] = await Promise.all([
        api.get('/configuracoes/empresa'),
        api.get('/configuracoes/estatisticas')
      ])
      setEmpresa(empresaRes.data.data)
      setEstatisticas(statsRes.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      titulo: 'Empresa',
      descricao: 'Informações da empresa, dados cadastrais',
      icon: Building2,
      href: '/app-empresa/configuracoes/empresa',
      cor: 'bg-blue-100 dark:bg-blue-900/20',
      corIcon: 'text-blue-600'
    },
    {
      titulo: 'Usuários',
      descricao: 'Gerenciar usuários e permissões',
      icon: Users,
      href: '/app-empresa/configuracoes/usuarios',
      cor: 'bg-green-100 dark:bg-green-900/20',
      corIcon: 'text-green-600',
      badge: estatisticas?.usuarios
    },
    {
      titulo: 'Notificações',
      descricao: 'Configurar alertas e notificações',
      icon: Bell,
      href: '/app-empresa/configuracoes/notificacoes',
      cor: 'bg-yellow-100 dark:bg-yellow-900/20',
      corIcon: 'text-yellow-600'
    },
    {
      titulo: 'Assinatura',
      descricao: 'Gerenciar plano e pagamentos',
      icon: CreditCard,
      href: '/app-empresa/configuracoes/assinatura',
      cor: 'bg-purple-100 dark:bg-purple-900/20',
      corIcon: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Configurações" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Configurações" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as configurações da sua empresa
            </p>
          </div>

          {/* Informações do Usuário */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user?.nome}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="outline">{user?.tipo}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{estatisticas?.usuarios}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {estatisticas?.percentualUsuarios.toFixed(0)}% do limite
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{estatisticas?.equipamentos}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {estatisticas?.percentualEquipamentos.toFixed(0)}% do limite
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Obras</p>
                <p className="text-2xl font-bold">{estatisticas?.obras}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Manutenções (30d)</p>
                <p className="text-2xl font-bold">{estatisticas?.manutencoes30dias}</p>
              </CardContent>
            </Card>
          </div>

          {/* Menu de Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item.href}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${item.cor}`}>
                              <Icon className={`h-5 w-5 ${item.corIcon}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{item.titulo}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.descricao}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge !== undefined && (
                              <Badge variant="secondary">{item.badge}</Badge>
                            )}
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Informações da Empresa */}
          {empresa && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Razão Social</p>
                      <p className="font-medium">{empresa.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-mono">{empresa.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{empresa.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p>{empresa.telefone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p>{empresa.endereco}, {empresa.cidade} - {empresa.estado}, CEP: {empresa.cep}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </>
  )
}