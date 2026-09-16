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

export function SuperAdminUsersTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getUsers.queryOptions())
  const users = data.users

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Teams</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableEmptyState colSpan={5}>No users</TableEmptyState>
        ) : (
          users.map((u) => (
            <TableRow key={u.userID}>
              <TableCell>{u.email ?? '—'}</TableCell>
              <TableCell>{u.name ?? '—'}</TableCell>
              <TableCell>{u.teams.length > 0 ? u.teams.join(', ') : '—'}</TableCell>
              <TableCell className="font-mono text-xs">{u.userID}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
