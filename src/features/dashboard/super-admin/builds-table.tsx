'use client'

import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
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

type BuildStatus = 'building' | 'failed' | 'success'
const BUILD_STATUSES: BuildStatus[] = ['building', 'failed', 'success']

export function SuperAdminBuildsTable() {
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<BuildStatus[]>([])

  const toggleStatus = (status: BuildStatus) => {
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
          placeholder="Search by build ID, template, or team…"
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {BUILD_STATUSES.map((status) => (
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
        <BuildsRows search={search} statuses={statuses} />
      </Suspense>
    </div>
  )
}

function BuildsRows({
  search,
  statuses,
}: {
  search: string
  statuses: BuildStatus[]
}) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getBuilds.infiniteQueryOptions(
        {
          search: search || undefined,
          statuses: statuses.length ? statuses : undefined,
        },
        { getNextPageParam: (page) => page.nextCursor ?? undefined }
      )
    )
  const builds = data.pages.flatMap((p) => p.builds)

  return (
    <div className="flex flex-col gap-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Build ID</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Finished</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {builds.length === 0 ? (
            <TableEmptyState colSpan={6}>No builds</TableEmptyState>
          ) : (
            builds.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell>{b.teamName}</TableCell>
                <TableCell>{b.template}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {b.finishedAt ? new Date(b.finishedAt).toLocaleString() : '—'}
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
