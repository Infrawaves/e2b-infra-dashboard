'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { PlatformRole } from '@/core/modules/super-admin/models'
import { defaultErrorToast, defaultSuccessToast, useToast } from '@/lib/hooks/use-toast'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/ui/primitives/button'
import { Input } from '@/ui/primitives/input'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table'

export function SuperAdminAdminsTable() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PlatformRole>('platform_admin')

  const listQueryKey = trpc.superAdmin.getAdmins.queryOptions().queryKey
  const { data } = useSuspenseQuery(trpc.superAdmin.getAdmins.queryOptions())
  const admins = data.admins

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: listQueryKey })

  const grant = useMutation(
    trpc.superAdmin.grantAdmin.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('Platform role granted.'))
        setEmail('')
        invalidate()
      },
      onError: (e) => toast(defaultErrorToast(e.message || 'Failed to grant role.')),
    })
  )

  const revoke = useMutation(
    trpc.superAdmin.revokeAdmin.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('Platform role revoked.'))
        invalidate()
      },
      onError: (e) => toast(defaultErrorToast(e.message || 'Failed to revoke role.')),
    })
  )

  const canGrant = email.trim().length > 0 && !grant.isPending

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (canGrant) grant.mutate({ email: email.trim(), role })
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-tertiary" htmlFor="grant-email">
            Email
          </label>
          <Input
            id="grant-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-[280px] border-stroke"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-tertiary" htmlFor="grant-role">
            Role
          </label>
          <select
            id="grant-role"
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
            className="h-9 rounded-md border border-stroke bg-bg px-2 text-sm"
          >
            <option value="platform_admin">platform_admin</option>
            <option value="super_admin">super_admin</option>
          </select>
        </div>
        <Button type="submit" disabled={!canGrant}>
          Grant
        </Button>
      </form>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 ? (
            <TableEmptyState colSpan={5}>No platform admins</TableEmptyState>
          ) : (
            admins.map((a) => (
              <TableRow key={a.userID}>
                <TableCell>{a.email ?? '—'}</TableCell>
                <TableCell>{a.role}</TableCell>
                <TableCell className="font-mono text-xs">{a.userID}</TableCell>
                <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="error"
                    size="small"
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate({ userID: a.userID })}
                  >
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
