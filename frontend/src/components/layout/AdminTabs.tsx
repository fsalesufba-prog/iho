import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
  disabled?: boolean
}

interface AdminTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  children: React.ReactNode
  className?: string
  listClassName?: string
  triggerClassName?: string
}

export function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  listClassName,
  triggerClassName
}: AdminTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <TabsList className={cn('w-full justify-start', listClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn('relative', triggerClassName)}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {children}
        </TabsContent>
      ))}
    </Tabs>
  )
}