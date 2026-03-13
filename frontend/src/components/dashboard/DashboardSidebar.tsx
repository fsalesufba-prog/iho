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
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
  roles?: Array<'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'>
}

interface DashboardSidebarProps {
  collapsed: boolean
  onCollapse: () => void
  mobile?: boolean
}

export function DashboardSidebar({ collapsed, onCollapse, mobile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdminSistema = user?.tipo === 'adm_sistema'

  const adminSistemaItems: SidebarItem[] = [
    { href: '/admin-sistema/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin-sistema/empresas', icon: Building2, label: 'Empresas' },
    { href: '/admin-sistema/usuarios', icon: Users, label: 'Usuários' },
    { href: '/admin-sistema/planos', icon: CreditCard, label: 'Planos' },
    { href: '/admin-sistema/pagamentos', icon: DollarSign, label: 'Pagamentos' },
    { href: '/admin-sistema/logs', icon: History, label: 'Logs' },
    { href: '/admin-sistema/blog', icon: BookOpen, label: 'Blog' },
    { href: '/admin-sistema/configuracoes', icon: Settings, label: 'Configurações' },
  ]

  const empresaItems: SidebarItem[] = [
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
    { href: '/app-empresa/alertas', icon: Bell, label: 'Alertas', badge: 5 },
  ]

  const items = isAdminSistema ? adminSistemaItems : empresaItems

  const filteredItems = items.filter(item => 
    !item.roles || (user && item.roles.includes(user.tipo as any))
  )

  if (mobile && collapsed) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <SidebarContent
            items={filteredItems}
            collapsed={false}
            onCollapse={onCollapse}
            pathname={pathname}
            user={user}
          />
        </div>
      </div>
    )
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 h-screen bg-background border-r transition-all duration-300',
      collapsed ? 'w-20' : 'w-64',
      mobile && 'hidden md:block'
    )}>
      <SidebarContent
        items={filteredItems}
        collapsed={collapsed}
        onCollapse={onCollapse}
        pathname={pathname}
        user={user}
      />
    </aside>
  )
}

function SidebarContent({ 
  items, 
  collapsed, 
  onCollapse, 
  pathname,
  user 
}: any) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn(
        'flex h-16 items-center border-b px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className="hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {items.map((item: SidebarItem) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center' : 'justify-start',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.nome?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nome}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn(
            'w-full',
            collapsed ? 'px-2' : 'justify-start'
          )}
        >
          <LogOut className={cn('h-5 w-5', collapsed ? '' : 'mr-2')} />
          {!collapsed && 'Sair'}
        </Button>
      </div>
    </div>
  )
}