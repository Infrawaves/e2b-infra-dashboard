'use client'

import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/ui/primitives/button'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table'
import { BlockTeamDialog } from './block-team-dialog'
import { EditTeamLimitsDialog } from './edit-team-limits-dialog'

export function SuperAdminTeamsTable() {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getTeams.infiniteQueryOptions(
        {},
        { getNextPageParam: (page) => page.nextCursor ?? undefined }
      )
    )
  const teams = data.pages.flatMap((p) => p.teams)

  // Both roles see limits; only super_admin can edit them.
  const { data: me } = useQuery(trpc.superAdmin.getMe.queryOptions())
  const canEdit = me?.platformRole === 'super_admin'

  return (
    <div className="flex flex-col gap-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sandboxes</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Limits</TableHead>
            {canEdit && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.length === 0 ? (
            <TableEmptyState colSpan={canEdit ? 9 : 8}>
              No teams
            </TableEmptyState>
          ) : (
            teams.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                <TableCell>{t.tier}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>
                  {t.isBanned ? 'Banned' : t.isBlocked ? 'Blocked' : 'Active'}
                </TableCell>
                <TableCell>{t.limits.concurrentSandboxes}</TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <EditTeamLimitsDialog team={t} readOnly={!canEdit} />
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <BlockTeamDialog team={t} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="small"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
