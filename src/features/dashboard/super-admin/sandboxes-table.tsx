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
  const [teamFilter, setTeamFilter] = useState('')
  const [sortDesc, setSortDesc] = useState(true)

  // Team options come from the teamIDs present in the current data.
  const teamOptions = useMemo(
    () => Array.from(new Set(data.sandboxes.map((s) => s.teamID))).sort(),
    [data.sandboxes]
  )

  const sandboxes = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = data.sandboxes
    if (teamFilter) rows = rows.filter((s) => s.teamID === teamFilter)
    if (q) {
      rows = rows.filter((s) =>
        [s.sandboxID, s.templateID, s.alias ?? '', s.teamID, s.state].some((f) =>
          f.toLowerCase().includes(q)
        )
      )
    }
    return [...rows].sort((a, b) => {
      const d = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      return sortDesc ? -d : d
    })
  }, [data.sandboxes, search, teamFilter, sortDesc])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedInput
          value={search}
          onChange={(v) => setSearch(String(v))}
          placeholder="Search by sandbox ID, template, team ID, or state…"
          className="max-w-sm"
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="h-9 rounded-md border border-stroke bg-bg px-2 text-sm"
        >
          <option value="">All teams</option>
          {teamOptions.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortDesc((v) => !v)}
          className="h-9 rounded-md border border-stroke bg-bg px-3 text-sm hover:text-fg"
        >
          Started {sortDesc ? '↓ newest' : '↑ oldest'}
        </button>
      </div>
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
