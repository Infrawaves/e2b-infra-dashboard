'use client'

import { useQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
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

// Non-suspense team selector populated from the first page of getTeams.
function TeamSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const trpc = useTRPC()
  const { data } = useQuery(
    trpc.superAdmin.getTeams.queryOptions({ limit: 100 })
  )
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-stroke bg-bg px-2 text-sm"
    >
      <option value="">All teams</option>
      {(data?.teams ?? []).map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  )
}

export function SuperAdminSnapshotsTable() {
  const [search, setSearch] = useState('')
  const [teamId, setTeamId] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedInput
          value={search}
          onChange={(v) => setSearch(String(v))}
          placeholder="Search by sandbox ID, base template, or team…"
          className="max-w-sm"
        />
        <TeamSelect value={teamId} onChange={setTeamId} />
      </div>
      <Suspense
        fallback={<div className="text-sm text-fg-tertiary">Loading…</div>}
      >
        <SnapshotsRows search={search} teamId={teamId} />
      </Suspense>
    </div>
  )
}

function SnapshotsRows({
  search,
  teamId,
}: {
  search: string
  teamId: string
}) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getSnapshots.infiniteQueryOptions(
        { search: search || undefined, teamId: teamId || undefined },
        { getNextPageParam: (page) => page.nextCursor ?? undefined }
      )
    )
  const snapshots = data.pages.flatMap((p) => p.snapshots)

  return (
    <div className="flex flex-col gap-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Sandbox ID</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Base template</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Paused</TableHead>
            <TableHead>Auto-pause</TableHead>
            <TableHead>vCPU</TableHead>
            <TableHead>RAM (MB)</TableHead>
            <TableHead>Disk (MB)</TableHead>
            <TableHead>Node</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshots.length === 0 ? (
            <TableEmptyState colSpan={10}>No paused sandboxes</TableEmptyState>
          ) : (
            snapshots.map((s) => (
              <TableRow key={s.snapshotID}>
                <TableCell className="font-mono text-xs">
                  {s.sandboxID}
                </TableCell>
                <TableCell>{s.teamName}</TableCell>
                <TableCell className="font-mono text-xs">
                  {s.baseTemplateAlias ?? s.baseTemplateID}
                </TableCell>
                <TableCell>
                  {new Date(s.sandboxStartedAt).toLocaleString()}
                </TableCell>
                <TableCell>{new Date(s.pausedAt).toLocaleString()}</TableCell>
                <TableCell>{s.autoPause ? 'Auto' : 'Manual'}</TableCell>
                <TableCell>{s.cpuCount}</TableCell>
                <TableCell>{s.memoryMB}</TableCell>
                <TableCell>{s.diskSizeMB ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs">
                  {s.originNodeID ?? '—'}
                </TableCell>
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
