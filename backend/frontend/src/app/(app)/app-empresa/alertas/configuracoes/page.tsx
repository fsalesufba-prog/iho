'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Fuel,
  Wrench,
  Package,
  Bell,
  Mail,
  Plus,
  X,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface ConfiguracaoAlerta {
  tipo: 'combustivel' | 'manutencao' | 'estoque'
  limite: number
  unidade: string
  notificarEmail: boolean
  notificarSistema: boolean
  destinatarios: string[]
  diasAntecedencia?: number
  horarioNotificacao?: string
}

export default function ConfiguracoesAlertasPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
 

  // Estado para cada tipo de configuração
  const [combustivel, setCombustivel] = useState<Partial<ConfiguracaoAlerta>>({
    tipo: 'combustivel',
    limite: 100,
    unidade: 'L',
    notificarEmail: false,
    notificarSistema: true,
    destinatarios: []
  })

  const [manutencao, setManutencao] = useState<Partial<ConfiguracaoAlerta>>({
    tipo: 'manutencao',
    limite: 7,
    unidade: 'dias',
    notificarEmail: false,
    notificarSistema: true,
    destinatarios: [],
    diasAntecedencia: 7
  })

  const [estoque, setEstoque] = useState<Partial<ConfiguracaoAlerta>>({
    tipo: 'estoque',
    limite: 10,
    unidade: '%',
    notificarEmail: false,
    notificarSistema: true,
    destinatarios: []
  })

  // Estados para adicionar emails
  const [novoEmailCombustivel, setNovoEmailCombustivel] = useState('')
  const [novoEmailManutencao, setNovoEmailManutencao] = useState('')
  const [novoEmailEstoque, setNovoEmailEstoque] = useState('')

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/alertas/configuracoes')
      const configs = response.data.data

      configs.forEach((config: ConfiguracaoAlerta) => {
        if (config.tipo === 'combustivel') {
          setCombustivel(config)
        } else if (config.tipo === 'manutencao') {
          setManutencao(config)
        } else if (config.tipo === 'estoque') {
          setEstoque(config)
        }
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarEmail = (tipo: string, email: string) => {
    if (!email || !email.includes('@')) return

    if (tipo === 'combustivel') {
      if (combustivel.destinatarios?.includes(email)) return
      setCombustivel({
        ...combustivel,
        destinatarios: [...(combustivel.destinatarios || []), email]
      })
      setNovoEmailCombustivel('')
    } else if (tipo === 'manutencao') {
      if (manutencao.destinatarios?.includes(email)) return
      setManutencao({
        ...manutencao,
        destinatarios: [...(manutencao.destinatarios || []), email]
      })
      setNovoEmailManutencao('')
    } else if (tipo === 'estoque') {
      if (estoque.destinatarios?.includes(email)) return
      setEstoque({
        ...estoque,
        destinatarios: [...(estoque.destinatarios || []), email]
      })
      setNovoEmailEstoque('')
    }
  }

  const removerEmail = (tipo: string, email: string) => {
    if (tipo === 'combustivel') {
      setCombustivel({
        ...combustivel,
        destinatarios: combustivel.destinatarios?.filter(e => e !== email)
      })
    } else if (tipo === 'manutencao') {
      setManutencao({
        ...manutencao,
        destinatarios: manutencao.destinatarios?.filter(e => e !== email)
      })
    } else if (tipo === 'estoque') {
      setEstoque({
        ...estoque,
        destinatarios: estoque.destinatarios?.filter(e => e !== email)
      })
    }
  }

  const handleSalvar = async (tipo: string) => {
    try {
      setSaving(true)
      
      let config
      if (tipo === 'combustivel') {
        config = combustivel
      } else if (tipo === 'manutencao') {
        config = manutencao
      } else {
        config = estoque
      }

      await api.post('/alertas/configuracoes', config)

      toast({
        title: 'Configurações salvas',
        description: `As configurações de ${tipo} foram salvas com sucesso.`
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSalvarTodas = async () => {
    try {
      setSaving(true)
      
      await Promise.all([
        api.post('/alertas/configuracoes', combustivel),
        api.post('/alertas/configuracoes', manutencao),
        api.post('/alertas/configuracoes', estoque)
      ])

      toast({
        title: 'Configurações salvas',
        description: 'Todas as configurações foram salvas com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Configurações de Alertas" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
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
        <Header title="Configurações de Alertas" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/alertas"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Alertas
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Configurações de Alertas
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure os limites e notificações para cada tipo de alerta
              </p>
            </div>

            <Button onClick={handleSalvarTodas} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Todas'}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="combustivel" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="combustivel">
                <Fuel className="mr-2 h-4 w-4" />
                Combustível
              </TabsTrigger>
              <TabsTrigger value="manutencao">
                <Wrench className="mr-2 h-4 w-4" />
                Manutenção
              </TabsTrigger>
              <TabsTrigger value="estoque">
                <Package className="mr-2 h-4 w-4" />
                Estoque
              </TabsTrigger>
            </TabsList>

            {/* Configurações de Combustível */}
            <TabsContent value="combustivel">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    Alertas de Combustível
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="combustivel-limite">Limite de consumo (L/dia)</Label>
                      <Input
                        id="combustivel-limite"
                        type="number"
                        min="0"
                        value={combustivel.limite}
                        onChange={(e) => setCombustivel({ ...combustivel, limite: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="combustivel-unidade">Unidade</Label>
                      <Input
                        id="combustivel-unidade"
                        value={combustivel.unidade}
                        onChange={(e) => setCombustivel({ ...combustivel, unidade: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="combustivel-sistema" className="font-medium">Notificação no Sistema</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas dentro do sistema
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="combustivel-sistema"
                        checked={combustivel.notificarSistema}
                        onCheckedChange={(checked) => setCombustivel({ ...combustivel, notificarSistema: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="combustivel-email" className="font-medium">Notificação por E-mail</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas por e-mail
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="combustivel-email"
                        checked={combustivel.notificarEmail}
                        onCheckedChange={(checked) => setCombustivel({ ...combustivel, notificarEmail: checked })}
                      />
                    </div>

                    {combustivel.notificarEmail && (
                      <div className="space-y-4 pl-8">
                        <div className="flex gap-2">
                          <Input
                            placeholder="email@exemplo.com"
                            value={novoEmailCombustivel}
                            onChange={(e) => setNovoEmailCombustivel(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => adicionarEmail('combustivel', novoEmailCombustivel)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {combustivel.destinatarios && combustivel.destinatarios.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {combustivel.destinatarios.map((email) => (
                              <Badge
                                key={email}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removerEmail('combustivel', email)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSalvar('combustivel')} disabled={saving}>
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Manutenção */}
            <TabsContent value="manutencao">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Alertas de Manutenção
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manutencao-dias">Dias de antecedência</Label>
                      <Input
                        id="manutencao-dias"
                        type="number"
                        min="0"
                        value={manutencao.diasAntecedencia}
                        onChange={(e) => setManutencao({ ...manutencao, diasAntecedencia: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manutencao-horario">Horário de notificação</Label>
                      <Input
                        id="manutencao-horario"
                        type="time"
                        value={manutencao.horarioNotificacao || '08:00'}
                        onChange={(e) => setManutencao({ ...manutencao, horarioNotificacao: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="manutencao-sistema" className="font-medium">Notificação no Sistema</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas dentro do sistema
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="manutencao-sistema"
                        checked={manutencao.notificarSistema}
                        onCheckedChange={(checked) => setManutencao({ ...manutencao, notificarSistema: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="manutencao-email" className="font-medium">Notificação por E-mail</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas por e-mail
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="manutencao-email"
                        checked={manutencao.notificarEmail}
                        onCheckedChange={(checked) => setManutencao({ ...manutencao, notificarEmail: checked })}
                      />
                    </div>

                    {manutencao.notificarEmail && (
                      <div className="space-y-4 pl-8">
                        <div className="flex gap-2">
                          <Input
                            placeholder="email@exemplo.com"
                            value={novoEmailManutencao}
                            onChange={(e) => setNovoEmailManutencao(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => adicionarEmail('manutencao', novoEmailManutencao)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {manutencao.destinatarios && manutencao.destinatarios.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {manutencao.destinatarios.map((email) => (
                              <Badge
                                key={email}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removerEmail('manutencao', email)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSalvar('manutencao')} disabled={saving}>
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Estoque */}
            <TabsContent value="estoque">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Alertas de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoque-limite">Percentual mínimo (%)</Label>
                      <Input
                        id="estoque-limite"
                        type="number"
                        min="0"
                        max="100"
                        value={estoque.limite}
                        onChange={(e) => setEstoque({ ...estoque, limite: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estoque-unidade">Unidade</Label>
                      <Input
                        id="estoque-unidade"
                        value={estoque.unidade}
                        onChange={(e) => setEstoque({ ...estoque, unidade: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="estoque-sistema" className="font-medium">Notificação no Sistema</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas dentro do sistema
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="estoque-sistema"
                        checked={estoque.notificarSistema}
                        onCheckedChange={(checked) => setEstoque({ ...estoque, notificarSistema: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="estoque-email" className="font-medium">Notificação por E-mail</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba alertas por e-mail
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="estoque-email"
                        checked={estoque.notificarEmail}
                        onCheckedChange={(checked) => setEstoque({ ...estoque, notificarEmail: checked })}
                      />
                    </div>

                    {estoque.notificarEmail && (
                      <div className="space-y-4 pl-8">
                        <div className="flex gap-2">
                          <Input
                            placeholder="email@exemplo.com"
                            value={novoEmailEstoque}
                            onChange={(e) => setNovoEmailEstoque(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => adicionarEmail('estoque', novoEmailEstoque)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {estoque.destinatarios && estoque.destinatarios.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {estoque.destinatarios.map((email) => (
                              <Badge
                                key={email}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => removerEmail('estoque', email)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSalvar('estoque')} disabled={saving}>
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </main>
    </>
  )
}