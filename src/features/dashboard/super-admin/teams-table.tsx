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

export function SuperAdminTeamsTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getTeams.queryOptions())
  const teams = data.teams

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.length === 0 ? (
          <TableEmptyState colSpan={6}>No teams</TableEmptyState>
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
              <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
