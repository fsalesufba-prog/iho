'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Building2,
  Users,
  CreditCard,
  ClipboardList,
  Wrench,
  Package,
  BarChart3,
  DollarSign,
  FileText,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderTree,
  Truck,
  Calculator,
  TrendingUp,
  BookOpen,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Logo } from '@/components/common/Logo'
import { SidebarItem } from './SidebarItem'
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onCollapse: () => void
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ collapsed, onCollapse, mobile, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdminSistema = user?.tipo === 'adm_sistema'

  const adminSistemaItems = [
    { href: '/admin-sistema/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin-sistema/empresas', icon: Building2, label: 'Empresas' },
    { href: '/admin-sistema/usuarios', icon: Users, label: 'Usuários' },
    { href: '/admin-sistema/planos', icon: CreditCard, label: 'Planos' },
    { href: '/admin-sistema/pagamentos', icon: DollarSign, label: 'Pagamentos' },
    { href: '/admin-sistema/logs', icon: History, label: 'Logs' },
    { href: '/admin-sistema/blog', icon: BookOpen, label: 'Blog' },
    { href: '/admin-sistema/configuracoes', icon: Settings, label: 'Configurações' },
  ]

  const empresaItems = [
    { href: '/app-empresa/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/app-empresa/obras', icon: Building2, label: 'Obras' },
    { href: '/app-empresa/frentes-servico', icon: FolderTree, label: 'Frentes de Serviço' },
    { href: '/app-empresa/centros-custo', icon: Calculator, label: 'Centros de Custo' },
    { href: '/app-empresa/equipamentos', icon: Truck, label: 'Equipamentos' },
    { href: '/app-empresa/manutencao', icon: Wrench, label: 'Manutenção' },
    { href: '/app-empresa/almoxarifado', icon: Package, label: 'Almoxarifado' },
    { href: '/app-empresa/indicadores', icon: BarChart3, label: 'Indicadores' },
    { href: '/app-empresa/financeiro', icon: DollarSign, label: 'Financeiro' },
    { href: '/app-empresa/medicao', icon: FileText, label: 'Medição' },
    { href: '/app-empresa/previsao', icon: TrendingUp, label: 'Previsão' },
    { href: '/app-empresa/relatorios', icon: ClipboardList, label: 'Relatórios' },
    { href: '/app-empresa/alertas', icon: Bell, label: 'Alertas' },
  ]

  const items = isAdminSistema ? adminSistemaItems : empresaItems

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex h-16 items-center border-b px-4">
            <Logo size="sm" />
          </div>

          <ScrollArea className="h-[calc(100vh-4rem)] py-4">
            <nav className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href || pathname.startsWith(item.href + '/')}
                  collapsed={false}
                  onClick={onClose}
                />
              ))}
            </nav>

            <Separator className="my-4" />

            <div className="px-2">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen bg-background border-r transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Logo size={collapsed ? 'icon' : 'sm'} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className="ml-auto hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="px-2">
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </ScrollArea>
    </aside>
  )
}