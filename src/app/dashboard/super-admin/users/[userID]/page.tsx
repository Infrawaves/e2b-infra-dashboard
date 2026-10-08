import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminUserDetail } from '@/features/dashboard/super-admin/user-detail'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

type Props = {
  params: Promise<{ userID: string }>
}

export default async function SuperAdminUserDetailPage({ params }: Props) {
  const { userID } = await params

  prefetch(trpc.superAdmin.getUser.queryOptions({ userID }))

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminUserDetail userID={userID} />
      </Suspense>
    </HydrateClient>
  )
}
