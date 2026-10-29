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
import { AddUserToTeamDialog } from './add-user-to-team-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { RemoveUserTeamsDialog } from './remove-user-teams-dialog'

export function SuperAdminUsersTable() {
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <DebouncedInput
        value={search}
        onChange={(v) => setSearch(String(v))}
        placeholder="Search by email or name…"
        className="max-w-sm"
      />
      <Suspense
        fallback={<div className="text-sm text-fg-tertiary">Loading…</div>}
      >
        <UsersRows search={search} />
      </Suspense>
    </div>
  )
}

function UsersRows({ search }: { search: string }) {
  const trpc = useTRPC()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.superAdmin.getUsers.infiniteQueryOptions(
        { search: search || undefined },
        { getNextPageParam: (page) => page.nextCursor ?? undefined }
      )
    )
  const users = data.pages.flatMap((p) => p.users)

  // Add-to-team and delete are super_admin-only actions.
  const meQuery = useQuery(trpc.superAdmin.getMe.queryOptions())
  const canManage = meQuery.data?.platformRole === 'super_admin'

  const colSpan = canManage ? 6 : 5

  return (
    <div className="flex flex-col gap-4">
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
            <TableEmptyState colSpan={colSpan}>No groups</TableEmptyState>
          ) : (
            users.map((u) => (
              <TableRow key={u.userID}>
                <TableCell>
                  <Link
                    href={PROTECTED_URLS.SUPER_ADMIN_USER(u.userID)}
                    className="hover:underline"
                  >
                    {u.email ?? u.userID}
                  </Link>
                </TableCell>
                <TableCell>{u.name ?? '—'}</TableCell>
                <TableCell>
                  {u.teams.length > 0
                    ? u.teams.map((t) => t.name).join(', ')
                    : '—'}
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
                      <RemoveUserTeamsDialog
                        user={u}
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
