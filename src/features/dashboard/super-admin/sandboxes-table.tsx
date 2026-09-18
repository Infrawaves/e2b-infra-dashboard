'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTRPC } from '@/trpc/client'
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

export function SuperAdminSandboxesTable() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getSandboxes.queryOptions())
  const [search, setSearch] = useState('')

  const sandboxes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data.sandboxes
    return data.sandboxes.filter((s) =>
      [s.sandboxID, s.templateID, s.alias ?? '', s.teamID, s.state].some((f) =>
        f.toLowerCase().includes(q)
      )
    )
  }, [data.sandboxes, search])

  return (
    <div className="flex flex-col gap-4">
      <DebouncedInput
        value={search}
        onChange={(v) => setSearch(String(v))}
        placeholder="Search by sandbox ID, template, team ID, or state…"
        className="max-w-sm"
      />
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
                <TableCell className="font-mono text-xs">
                  {s.sandboxID}
                </TableCell>
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
    </div>
  )
}
