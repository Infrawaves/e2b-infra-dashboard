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

export function SuperAdminSandboxesTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.superAdmin.getSandboxes.queryOptions()
  )
  const sandboxes = data.sandboxes

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Sandbox ID</TableHead>
          <TableHead>Team ID</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>State</TableHead>
          <TableHead>vCPU</TableHead>
          <TableHead>RAM (MB)</TableHead>
          <TableHead>Started</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sandboxes.length === 0 ? (
          <TableEmptyState colSpan={7}>No running sandboxes</TableEmptyState>
        ) : (
          sandboxes.map((s) => (
            <TableRow key={s.sandboxID}>
              <TableCell className="font-mono text-xs">{s.sandboxID}</TableCell>
              <TableCell className="font-mono text-xs">{s.teamID}</TableCell>
              <TableCell>{s.alias ?? s.templateID}</TableCell>
              <TableCell>{s.state}</TableCell>
              <TableCell>{s.cpuCount}</TableCell>
              <TableCell>{s.memoryMB}</TableCell>
              <TableCell>{new Date(s.startedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
