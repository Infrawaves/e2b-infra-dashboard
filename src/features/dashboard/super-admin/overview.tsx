'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { Card, CardHeader, CardTitle } from '@/ui/primitives/card'

export function SuperAdminOverview() {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.superAdmin.getStats.queryOptions())

  const cards = [
    { label: 'Teams', value: data.teamCount },
    { label: 'Users', value: data.userCount },
    { label: 'Templates', value: data.templateCount },
    { label: 'Builds', value: data.buildCount },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
  )
}
