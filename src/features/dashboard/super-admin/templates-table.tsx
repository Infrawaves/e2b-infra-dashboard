'use client'

import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
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

export function SuperAdminTemplatesTable() {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getTemplates.infiniteQueryOptions(
        {},
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
