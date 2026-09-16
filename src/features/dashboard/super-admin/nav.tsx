'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROTECTED_URLS } from '@/configs/urls'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'

const TABS = [
  { label: 'Sandboxes', href: PROTECTED_URLS.SUPER_ADMIN_SANDBOXES },
  { label: 'Templates', href: PROTECTED_URLS.SUPER_ADMIN_TEMPLATES },
  { label: 'Builds', href: PROTECTED_URLS.SUPER_ADMIN_BUILDS },
  { label: 'Teams', href: PROTECTED_URLS.SUPER_ADMIN_TEAMS },
  { label: 'Users', href: PROTECTED_URLS.SUPER_ADMIN_USERS },
]

export function SuperAdminNav() {
  const pathname = usePathname()
  const trpc = useTRPC()

  // Admins tab is super_admin only; getMe drives the gate (non-suspense so nav never blocks).
  const { data: me } = useQuery(trpc.superAdmin.getMe.queryOptions())
  const tabs =
    me?.platformRole === 'super_admin'
      ? [...TABS, { label: 'Admins', href: PROTECTED_URLS.SUPER_ADMIN_ADMINS }]
      : TABS

  return (
    <nav className="flex items-center gap-1 border-b border-stroke px-4">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={false}
            className={cn(
              'border-b-2 px-3 py-2 text-sm',
              active
                ? 'border-fg text-fg'
                : 'border-transparent text-fg-secondary hover:text-fg'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
