import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminUsersTable } from '@/features/dashboard/super-admin/users-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminUsersPage() {
  prefetch(
    trpc.superAdmin.getUsers.infiniteQueryOptions(
      {},
      { getNextPageParam: (page) => page.nextCursor ?? undefined }
    )
  )

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminUsersTable />
      </Suspense>
    </HydrateClient>
  )
}
