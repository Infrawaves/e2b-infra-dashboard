'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
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

export function DeleteTeamDialog({
  teamID,
  label,
}: {
  teamID: string
  label: string
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const teamsQueryKey = trpc.superAdmin.getTeams.pathKey()

  const remove = useMutation(
    trpc.superAdmin.deleteTeam.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('Team deleted.'))
        setOpen(false)
        void queryClient.invalidateQueries({ queryKey: teamsQueryKey })
      },
      // A 409 carries the backend's "still owns N resources" message verbatim.
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to delete team.')),
    })
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="error" size="small">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete team</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fg-secondary">
          This permanently deletes {label}. It only succeeds if the team owns no
          templates, snapshots, or volumes; otherwise it is rejected and left
          untouched. This cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={remove.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="error"
            onClick={() => remove.mutate({ teamID })}
            disabled={remove.isPending}
          >
            Delete team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
