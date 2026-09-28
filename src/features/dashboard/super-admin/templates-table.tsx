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

export function SuperAdminTemplatesTable() {
  const [search, setSearch] = useState('')
  // undefined = all, true = public only, false = private only
  const [visibility, setVisibility] = useState<boolean | undefined>(undefined)

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
        <TemplatesRows search={search} visibility={visibility} />
      </Suspense>
    </div>
  )
}

function TemplatesRows({
  search,
  visibility,
}: {
  search: string
  visibility: boolean | undefined
}) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getTemplates.infiniteQueryOptions(
        { search: search || undefined, public: visibility },
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
