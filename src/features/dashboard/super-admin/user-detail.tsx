'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { PROTECTED_URLS } from '@/configs/urls'
import { useTRPC } from '@/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase text-fg-tertiary">{label}</span>
      <span className="text-sm text-fg">{value}</span>
    </div>
  )
}

export function SuperAdminUserDetail({ userID }: { userID: string }) {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.superAdmin.getUser.queryOptions({ userID })
  )
  const { user } = data

  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{user.email ?? user.userID}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Field
            label="User ID"
            value={<span className="font-mono text-xs">{user.userID}</span>}
          />
          <Field label="Email" value={user.email ?? '—'} />
          <Field label="Name" value={user.name ?? '—'} />
          <Field
            label="Created"
            value={new Date(user.createdAt).toLocaleString()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teams ({user.teams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Team ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.teams.length === 0 ? (
                <TableEmptyState colSpan={2}>No teams</TableEmptyState>
              ) : (
                user.teams.map((t) => (
                  <TableRow key={t.teamID}>
                    <TableCell>
                      <Link
                        href={PROTECTED_URLS.SUPER_ADMIN_TEAM(t.teamID)}
                        className="hover:underline"
                      >
                        {t.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {t.teamID}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
