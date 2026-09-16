import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminAdminsTable } from '@/features/dashboard/super-admin/admins-table'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminAdminsPage() {
  prefetch(trpc.superAdmin.getAdmins.queryOptions())

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminAdminsTable />
      </Suspense>
    </HydrateClient>
  )
}
