'use client'

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
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
import { AddUserToTeamDialog } from './add-user-to-team-dialog'
import { DeleteUserDialog } from './delete-user-dialog'

export function SuperAdminUsersTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getUsers.queryOptions())
  const users = data.users

  // Add-to-team and delete are super_admin-only actions.
  const meQuery = useQuery(trpc.superAdmin.getMe.queryOptions())
  const canManage = meQuery.data?.platformRole === 'super_admin'

  const colSpan = canManage ? 6 : 5

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Teams</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Created</TableHead>
          {canManage && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableEmptyState colSpan={colSpan}>No users</TableEmptyState>
        ) : (
          users.map((u) => (
            <TableRow key={u.userID}>
              <TableCell>{u.email ?? '—'}</TableCell>
              <TableCell>{u.name ?? '—'}</TableCell>
              <TableCell>
                {u.teams.length > 0 ? u.teams.join(', ') : '—'}
              </TableCell>
              <TableCell className="font-mono text-xs">{u.userID}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <AddUserToTeamDialog
                      userID={u.userID}
                      label={u.email ?? u.userID}
                    />
                    <DeleteUserDialog
                      userID={u.userID}
                      label={u.email ?? u.userID}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
