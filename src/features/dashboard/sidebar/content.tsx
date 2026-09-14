'use client'

import { useQuery } from '@tanstack/react-query'
import micromatch from 'micromatch'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { SIDEBAR_MAIN_LINKS, type SidebarNavItem } from '@/configs/sidebar'
import { PROTECTED_URLS } from '@/configs/urls'

import { useIsMobile } from '@/lib/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { HoverPrefetchLink } from '@/ui/hover-prefetch-link'
import { EnterpriseIcon } from '@/ui/primitives/icons'
import {
  SIDEBAR_TRANSITION_CLASSNAMES,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/ui/primitives/sidebar'
import { useDashboard } from '../context'

type GroupedLinks = {
  [key: string]: SidebarNavItem[]
}

const createGroupedLinks = (links: SidebarNavItem[]): GroupedLinks => {
  return links.reduce((acc, link) => {
    const group = link.group || 'ungrouped'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(link)
    return acc
  }, {} as GroupedLinks)
}

export default function DashboardSidebarContent() {
  const { team } = useDashboard()
  const selectedTeamSlug = team.slug

  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const trpc = useTRPC()

  // Non-suspense so the sidebar never blocks on it; non-admins get a null role.
  const { data: me } = useQuery(trpc.superAdmin.getMe.queryOptions())
  const isPlatformAdmin = Boolean(me?.platformRole)

  const groupedNavLinks = useMemo(
    () => createGroupedLinks(SIDEBAR_MAIN_LINKS),
    []
  )

  const isActive = (link: SidebarNavItem) => {
    if (!pathname || !link.activeMatch) return false

    return micromatch.isMatch(pathname, link.activeMatch)
  }

  return (
    <SidebarContent className="overflow-x-hidden gap-0">
      {Object.entries(groupedNavLinks).map(([group, links], ix) => (
        <SidebarGroup key={group}>
          {group !== 'ungrouped' && (
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
          )}
          <SidebarMenu>
            {links.map((item) => {
              const href = item.href({
                teamSlug: selectedTeamSlug,
              })

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={isActive(item)}
                    asChild
                    tooltip={item.label}
                  >
                    <HoverPrefetchLink
                      href={href}
                      onClick={
                        isMobile
                          ? () => {
                              setOpenMobile(false)
                            }
                          : undefined
                      }
                    >
                      <item.icon
                        className={cn(
                          'transition-[size]',
                          SIDEBAR_TRANSITION_CLASSNAMES,
                          isActive(item) && 'text-accent-main-highlight'
                        )}
                      />
                      <span>{item.label}</span>
                    </HoverPrefetchLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
      {isPlatformAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname?.startsWith('/dashboard/super-admin')}
                asChild
                tooltip="Super Admin"
              >
                <HoverPrefetchLink
                  href={PROTECTED_URLS.SUPER_ADMIN}
                  onClick={
                    isMobile
                      ? () => {
                          setOpenMobile(false)
                        }
                      : undefined
                  }
                >
                  <EnterpriseIcon
                    className={cn(
                      'transition-[size]',
                      SIDEBAR_TRANSITION_CLASSNAMES
                    )}
                  />
                  <span>Super Admin</span>
                </HoverPrefetchLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </SidebarContent>
  )
}
