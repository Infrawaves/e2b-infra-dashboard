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

export function SuperAdminTemplatesTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.superAdmin.getTemplates.queryOptions()
  )
  const templates = data.templates

  return (
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
  )
}
