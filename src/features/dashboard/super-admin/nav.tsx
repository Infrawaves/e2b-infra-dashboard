'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROTECTED_URLS } from '@/configs/urls'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Sandboxes', href: PROTECTED_URLS.SUPER_ADMIN_SANDBOXES },
  { label: 'Templates', href: PROTECTED_URLS.SUPER_ADMIN_TEMPLATES },
  { label: 'Builds', href: PROTECTED_URLS.SUPER_ADMIN_BUILDS },
  { label: 'Teams', href: PROTECTED_URLS.SUPER_ADMIN_TEAMS },
]

export function SuperAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 border-b border-stroke px-4">
      {TABS.map((tab) => {
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
