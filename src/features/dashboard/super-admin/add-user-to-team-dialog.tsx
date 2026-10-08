'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  defaultErrorToast,
  defaultSuccessToast,
  useToast,
} from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/ui/primitives/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/primitives/dialog'
import { DebouncedInput } from '@/ui/primitives/input'

export function AddUserToTeamDialog({
  userID,
  label,
}: {
  userID: string
  label: string
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [teamID, setTeamID] = useState('')
  const [teamSearch, setTeamSearch] = useState('')

  // Server-side search so teams beyond the first page are findable.
  const teamsQuery = useQuery(
    trpc.superAdmin.getTeams.queryOptions({
      search: teamSearch || undefined,
    })
  )
  const usersQueryKey = trpc.superAdmin.getUsers.pathKey()

  const add = useMutation(
    trpc.superAdmin.addUserToTeam.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('User added to team.'))
        setOpen(false)
        setTeamID('')
        setTeamSearch('')
        void queryClient.invalidateQueries({ queryKey: usersQueryKey })
      },
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to add user to team.')),
    })
  )

  const teams = teamsQuery.data?.teams ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="small">
          Add to team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {label} to team</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (teamID) add.mutate({ userID, teamID })
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs text-fg-tertiary">Team</span>
            <DebouncedInput
              value={teamSearch}
              onChange={(v) => setTeamSearch(String(v))}
              placeholder="Search teams by name, slug, or email…"
            />
            <div className="max-h-64 overflow-auto rounded-md border border-stroke">
              {teams.length === 0 ? (
                <p className="px-3 py-2 text-sm text-fg-tertiary">
                  {teamsQuery.isFetching
                    ? 'Searching…'
                    : teamSearch
                      ? 'No teams match.'
                      : 'No teams.'}
                </p>
              ) : (
                teams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTeamID(t.id)}
                    className={cn(
                      'flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-bg-hover',
                      teamID === t.id && 'bg-bg-hover'
                    )}
                  >
                    <span className="text-fg">{t.name}</span>
                    <span className="font-mono text-xs text-fg-tertiary">
                      {t.slug}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!teamID || add.isPending}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
