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

type TemplatesSort = 'created_at_asc' | 'created_at_desc'

// Non-suspense team selector populated from the first page of getTeams. For a
// large platform this lists only the first page; search still works server-side.
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

export function SuperAdminTemplatesTable() {
  const [search, setSearch] = useState('')
  // undefined = all, true = public only, false = private only
  const [visibility, setVisibility] = useState<boolean | undefined>(undefined)
  const [teamId, setTeamId] = useState('')
  const [sort, setSort] = useState<TemplatesSort>('created_at_desc')

  const toggleVisibility = (value: boolean) => {
    setVisibility((prev) => (prev === value ? undefined : value))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedInput
          value={search}
          onChange={(v) => setSearch(String(v))}
          placeholder="Search by name, alias, or template ID…"
          className="max-w-sm"
        />
        <TeamSelect value={teamId} onChange={setTeamId} />
        <button
          type="button"
          onClick={() =>
            setSort((s) =>
              s === 'created_at_desc' ? 'created_at_asc' : 'created_at_desc'
            )
          }
          className="h-9 rounded-md border border-stroke bg-bg px-3 text-sm hover:text-fg"
        >
          Created {sort === 'created_at_desc' ? '↓ newest' : '↑ oldest'}
        </button>
        <div className="flex gap-2">
          <Button
            variant={visibility === true ? 'primary' : 'secondary'}
            size="small"
            onClick={() => toggleVisibility(true)}
          >
            Public
          </Button>
          <Button
            variant={visibility === false ? 'primary' : 'secondary'}
            size="small"
            onClick={() => toggleVisibility(false)}
          >
            Private
          </Button>
        </div>
      </div>
      <Suspense
        fallback={<div className="text-sm text-fg-tertiary">Loading…</div>}
      >
        <TemplatesRows
          search={search}
          visibility={visibility}
          teamId={teamId}
          sort={sort}
        />
      </Suspense>
    </div>
  )
}

function TemplatesRows({
  search,
  visibility,
  teamId,
  sort,
}: {
  search: string
  visibility: boolean | undefined
  teamId: string
  sort: TemplatesSort
}) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getTemplates.infiniteQueryOptions(
        {
          search: search || undefined,
          public: visibility,
          teamId: teamId || undefined,
          sort,
        },
        { getNextPageParam: (page) => page.nextCursor ?? undefined }
      )
    )
  const templates = data.pages.flatMap((p) => p.templates)

  return (
    <div className="flex flex-col gap-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Template ID</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Aliases</TableHead>
            <TableHead>Public</TableHead>
            <TableHead>Builds</TableHead>
            <TableHead>Spawns</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableEmptyState colSpan={7}>No templates</TableEmptyState>
          ) : (
            templates.map((t) => (
              <TableRow key={t.templateID}>
                <TableCell className="font-mono text-xs">
                  {t.templateID}
                </TableCell>
                <TableCell>{t.teamName}</TableCell>
                <TableCell>{t.aliases.join(', ')}</TableCell>
                <TableCell>{t.public ? 'Yes' : 'No'}</TableCell>
                <TableCell>{t.buildCount}</TableCell>
                <TableCell>{t.spawnCount}</TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
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
