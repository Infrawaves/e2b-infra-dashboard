'use client'

import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { PROTECTED_URLS } from '@/configs/urls'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/ui/primitives/button'
import { DebouncedInput } from '@/ui/primitives/input'
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

type TeamStatus = 'active' | 'blocked' | 'banned'
const TEAM_STATUSES: TeamStatus[] = ['active', 'blocked', 'banned']

export function SuperAdminTeamsTable() {
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<TeamStatus[]>([])

  const toggleStatus = (status: TeamStatus) => {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedInput
          value={search}
          onChange={(v) => setSearch(String(v))}
          placeholder="Search by team name, slug, or email…"
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {TEAM_STATUSES.map((status) => (
            <Button
              key={status}
              variant={statuses.includes(status) ? 'primary' : 'secondary'}
              size="small"
              onClick={() => toggleStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
      <Suspense
        fallback={<div className="text-sm text-fg-tertiary">Loading…</div>}
      >
        <TeamsRows search={search} statuses={statuses} />
      </Suspense>
    </div>
  )
}

function TeamsRows({
  search,
  statuses,
}: {
  search: string
  statuses: TeamStatus[]
}) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getTeams.infiniteQueryOptions(
        {
          search: search || undefined,
          teamStatuses: statuses.length ? statuses : undefined,
        },
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
                <TableCell>
                  <Link
                    href={PROTECTED_URLS.SUPER_ADMIN_TEAM(t.id)}
                    className="hover:underline"
                  >
                    {t.name}
                  </Link>
                </TableCell>
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
