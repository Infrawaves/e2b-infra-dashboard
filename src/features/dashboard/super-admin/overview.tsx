'use client'

import { useMemo } from 'react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { Card, CardHeader, CardTitle } from '@/ui/primitives/card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table'

export function SuperAdminOverview() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getStats.queryOptions())

  // Non-suspense: running sandboxes come from infra-api/Redis and may be empty
  // or slow; the overview must render regardless.
  const { data: sandboxData } = useQuery(
    trpc.superAdmin.getSandboxes.queryOptions()
  )
  const { data: teamsData } = useQuery(
    trpc.superAdmin.getTeams.queryOptions({ limit: 100 })
  )

  const sandboxes = sandboxData?.sandboxes ?? []

  // Count running sandboxes per team, resolving team names where possible.
  const byTeam = useMemo(() => {
    const names = new Map((teamsData?.teams ?? []).map((t) => [t.id, t.name]))
    const counts = new Map<string, number>()
    for (const s of sandboxes) {
      counts.set(s.teamID, (counts.get(s.teamID) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([teamID, count]) => ({
        teamID,
        name: names.get(teamID) ?? teamID,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [sandboxes, teamsData])

  const cards = [
    { label: 'Teams', value: data.teamCount },
    { label: 'Groups', value: data.userCount },
    { label: 'Templates', value: data.templateCount },
    { label: 'Builds', value: data.buildCount },
    { label: 'Running sandboxes', value: sandboxes.length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-fg-secondary">
                {card.label}
              </CardTitle>
              <p className="text-2xl font-semibold">
                {card.value.toLocaleString()}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-fg-secondary">
          Running sandboxes by team
        </h2>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Team ID</TableHead>
              <TableHead>Running sandboxes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byTeam.length === 0 ? (
              <TableEmptyState colSpan={3}>
                No running sandboxes
              </TableEmptyState>
            ) : (
              byTeam.map((row) => (
                <TableRow key={row.teamID}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.teamID}
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
