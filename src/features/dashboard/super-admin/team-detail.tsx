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

export function SuperAdminTeamDetail({ teamID }: { teamID: string }) {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.superAdmin.getTeam.queryOptions({ teamID })
  )
  const { team, members, templates } = data.team

  const status = team.isBanned
    ? 'Banned'
    : team.isBlocked
      ? 'Blocked'
      : 'Active'

  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Field
            label="Team ID"
            value={<span className="font-mono text-xs">{team.id}</span>}
          />
          <Field
            label="Slug"
            value={<span className="font-mono text-xs">{team.slug}</span>}
          />
          <Field label="Tier" value={team.tier} />
          <Field label="Email" value={team.email || '—'} />
          <Field label="Status" value={status} />
          <Field
            label="Created"
            value={new Date(team.createdAt).toLocaleString()}
          />
          <Field
            label="Concurrent sandboxes"
            value={team.limits.concurrentSandboxes}
          />
          <Field label="Max vCPU" value={team.limits.maxVcpu} />
          <Field label="Max RAM (MB)" value={team.limits.maxRamMb} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableEmptyState colSpan={4}>No members</TableEmptyState>
              ) : (
                members.map((m) => (
                  <TableRow key={m.userID}>
                    <TableCell>
                      <Link
                        href={PROTECTED_URLS.SUPER_ADMIN_USER(m.userID)}
                        className="hover:underline"
                      >
                        {m.email ?? m.userID}
                      </Link>
                    </TableCell>
                    <TableCell>{m.name ?? '—'}</TableCell>
                    <TableCell>{m.isDefault ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Template ID</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Builds</TableHead>
                <TableHead>Spawns</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableEmptyState colSpan={6}>No templates</TableEmptyState>
              ) : (
                templates.map((t) => (
                  <TableRow key={t.templateID}>
                    <TableCell className="font-mono text-xs">
                      {t.templateID}
                    </TableCell>
                    <TableCell>{t.aliases.join(', ')}</TableCell>
                    <TableCell>{t.public ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{t.buildCount}</TableCell>
                    <TableCell>{t.spawnCount}</TableCell>
                    <TableCell>
                      {new Date(t.createdAt).toLocaleString()}
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
