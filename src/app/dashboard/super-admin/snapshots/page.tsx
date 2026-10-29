import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminSnapshotsTable } from '@/features/dashboard/super-admin/snapshots-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminSnapshotsPage() {
  prefetch(
    trpc.superAdmin.getSnapshots.infiniteQueryOptions(
      {},
      { getNextPageParam: (page) => page.nextCursor ?? undefined }
    )
  )

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminSnapshotsTable />
      </Suspense>
    </HydrateClient>
  )
}
