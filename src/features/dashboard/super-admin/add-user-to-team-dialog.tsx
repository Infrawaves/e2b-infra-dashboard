'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  defaultErrorToast,
  defaultSuccessToast,
  useToast,
} from '@/lib/hooks/use-toast'
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

  const teamsQuery = useQuery(trpc.superAdmin.getTeams.queryOptions())
  const usersQueryKey = trpc.superAdmin.getUsers.queryOptions().queryKey

  const add = useMutation(
    trpc.superAdmin.addUserToTeam.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('User added to team.'))
        setOpen(false)
        setTeamID('')
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
            <label className="text-xs text-fg-tertiary" htmlFor="add-team">
              Team
            </label>
            <select
              id="add-team"
              value={teamID}
              onChange={(e) => setTeamID(e.target.value)}
              className="h-9 rounded-md border border-stroke bg-bg px-2 text-sm"
            >
              <option value="">Select a team…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
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
