import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminBuildsTable } from '@/features/dashboard/super-admin/builds-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminBuildsPage() {
  prefetch(
    trpc.superAdmin.getBuilds.infiniteQueryOptions(
      {},
      { getNextPageParam: (page) => page.nextCursor ?? undefined }
    )
  )

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminBuildsTable />
      </Suspense>
    </HydrateClient>
  )
}
