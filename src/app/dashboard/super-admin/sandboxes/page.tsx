import { Suspense } from 'react'
import { SuperAdminSandboxesTable } from '@/features/dashboard/super-admin/sandboxes-table'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export default function SuperAdminSandboxesPage() {
  prefetch(trpc.superAdmin.getSandboxes.queryOptions())

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminSandboxesTable />
      </Suspense>
    </HydrateClient>
  )
}
