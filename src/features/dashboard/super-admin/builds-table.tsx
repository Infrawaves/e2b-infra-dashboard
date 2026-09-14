'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table'

export function SuperAdminBuildsTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getBuilds.queryOptions())
  const builds = data.builds

  return (
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
  )
}
