import { Suspense } from 'react'
import LoadingLayout from '@/features/dashboard/loading-layout'
import { SuperAdminTeamDetail } from '@/features/dashboard/super-admin/team-detail'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

type Props = {
  params: Promise<{ teamID: string }>
}

export default async function SuperAdminTeamDetailPage({ params }: Props) {
  const { teamID } = await params

  prefetch(trpc.superAdmin.getTeam.queryOptions({ teamID }))

  return (
    <HydrateClient>
      <Suspense fallback={<LoadingLayout />}>
        <SuperAdminTeamDetail teamID={teamID} />
      </Suspense>
    </HydrateClient>
  )
}
