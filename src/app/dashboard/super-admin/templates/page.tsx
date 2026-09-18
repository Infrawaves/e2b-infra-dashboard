import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminTemplatesTable } from '@/features/dashboard/super-admin/templates-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminTemplatesPage() {
  prefetch(
    trpc.superAdmin.getTemplates.infiniteQueryOptions(
      {},
      { getNextPageParam: (page) => page.nextCursor ?? undefined }
    )
  )

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminTemplatesTable />
      </Suspense>
    </HydrateClient>
  )
}
