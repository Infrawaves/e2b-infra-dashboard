import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminOverview } from '@/features/dashboard/super-admin/overview'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminOverviewPage() {
  prefetch(trpc.superAdmin.getStats.queryOptions())

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminOverview />
      </Suspense>
    </HydrateClient>
  )
}
