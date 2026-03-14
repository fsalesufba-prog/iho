'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Bell,
  Mail,
  BellRing,
  Loader2,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'

interface NotificacoesConfig {
  emailAlertas: boolean
  emailRelatorios: boolean
  emailManutencoes: boolean
  emailPromocoes: boolean
  sistemaAlertas: boolean
  sistemaManutencoes: boolean
  sistemaRelatorios: boolean
}

export default function ConfiguracoesNotificacoesPage() {
  const router = useRouter()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<NotificacoesConfig>({
    emailAlertas: true,
    emailRelatorios: false,
    emailManutencoes: true,
    emailPromocoes: false,
    sistemaAlertas: true,
    sistemaManutencoes: true,
    sistemaRelatorios: true
  })

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/configuracoes/notificacoes')
      setConfig(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar as configurações de notificação.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put('/configuracoes/notificacoes', config)

      toast({
        title: 'Configurações salvas',
        description: 'As configurações de notificação foram atualizadas.'
      })

      router.push('/app-empresa/configuracoes')
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
          <Header title="Configurações de Notificações" />
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
        <Header title="Configurações de Notificações" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notificações por Email */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                    Notificações por Email
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailAlertas" className="text-base">Alertas do Sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba alertas de manutenção, estoque e combustível por email
                        </p>
                      </div>
                      <Switch
                        id="emailAlertas"
                        checked={config.emailAlertas}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, emailAlertas: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailManutencoes" className="text-base">Manutenções Programadas</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba lembretes de manutenções programadas por email
                        </p>
                      </div>
                      <Switch
                        id="emailManutencoes"
                        checked={config.emailManutencoes}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, emailManutencoes: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailRelatorios" className="text-base">Relatórios Periódicos</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba relatórios gerenciais por email
                        </p>
                      </div>
                      <Switch
                        id="emailRelatorios"
                        checked={config.emailRelatorios}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, emailRelatorios: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailPromocoes" className="text-base">Promoções e Novidades</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba informações sobre novos recursos e promoções
                        </p>
                      </div>
                      <Switch
                        id="emailPromocoes"
                        checked={config.emailPromocoes}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, emailPromocoes: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notificações no Sistema */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <BellRing className="h-5 w-5 text-primary" />
                    Notificações no Sistema
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="sistemaAlertas" className="text-base">Alertas do Sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba alertas visuais dentro do sistema
                        </p>
                      </div>
                      <Switch
                        id="sistemaAlertas"
                        checked={config.sistemaAlertas}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, sistemaAlertas: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="sistemaManutencoes" className="text-base">Manutenções Programadas</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba lembretes de manutenções no sistema
                        </p>
                      </div>
                      <Switch
                        id="sistemaManutencoes"
                        checked={config.sistemaManutencoes}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, sistemaManutencoes: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="sistemaRelatorios" className="text-base">Relatórios Prontos</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações quando relatórios estiverem prontos
                        </p>
                      </div>
                      <Switch
                        id="sistemaRelatorios"
                        checked={config.sistemaRelatorios}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, sistemaRelatorios: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ações */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
    </>
  )
}