import { redirect } from 'next/navigation'
import type { Metadata } from 'next/types'
import { METADATA } from '@/configs/metadata'
import { AUTH_URLS, PROTECTED_URLS } from '@/configs/urls'
import { getAuthContext } from '@/core/server/auth'
import { SuperAdminNav } from '@/features/dashboard/super-admin/nav'
import { getQueryClient, trpc } from '@/trpc/server'

export const metadata: Metadata = {
  title: 'Super Admin - E2B',
  description: METADATA.description,
  robots: 'noindex, nofollow',
}

// Global (cross-team) super-admin section. Gated by platform role resolved from
// the signed-in user; non-admins are redirected back to the dashboard.
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authContext = await getAuthContext()

  if (!authContext) {
    throw redirect(AUTH_URLS.SIGN_IN)
  }

  const queryClient = getQueryClient()
  const me = await queryClient
    .fetchQuery(trpc.superAdmin.getMe.queryOptions())
    .catch(() => null)

  if (!me?.platformRole) {
    throw redirect(PROTECTED_URLS.DASHBOARD)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-1 px-4 pt-4">
        <h1 className="text-lg font-semibold">Super Admin</h1>
        <p className="text-sm text-fg-secondary">
          Platform-wide view across all teams.
        </p>
      </header>
      <SuperAdminNav />
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
