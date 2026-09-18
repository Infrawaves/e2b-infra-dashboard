import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminTeamsTable } from '@/features/dashboard/super-admin/teams-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminTeamsPage() {
  prefetch(
    trpc.superAdmin.getTeams.infiniteQueryOptions(
      {},
      { getNextPageParam: (page) => page.nextCursor ?? undefined }
    )
  )

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminTeamsTable />
      </Suspense>
    </HydrateClient>
  )
}
