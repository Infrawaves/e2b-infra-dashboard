'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { SuperAdminUser } from '@/core/modules/super-admin/models'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/primitives/dialog'

export function RemoveUserTeamsDialog({
  user,
  label,
}: {
  user: SuperAdminUser
  label: string
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const usersQueryKey = trpc.superAdmin.getUsers.pathKey()

  const remove = useMutation(
    trpc.superAdmin.removeUserFromTeam.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('User removed from team.'))
        void queryClient.invalidateQueries({ queryKey: usersQueryKey })
      },
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to remove from team.')),
    })
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="small"
          disabled={user.teams.length === 0}
        >
          Remove from team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{label}'s teams</DialogTitle>
        </DialogHeader>
        {user.teams.length === 0 ? (
          <p className="text-sm text-fg-secondary">
            This user is not a member of any team.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {user.teams.map((t) => (
              <li
                key={t.teamID}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm">{t.name}</span>
                <Button
                  variant="error"
                  size="small"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate({ userID: user.userID, teamID: t.teamID })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
