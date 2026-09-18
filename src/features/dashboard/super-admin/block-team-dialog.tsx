'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { SuperAdminTeam } from '@/core/modules/super-admin/models'
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
import { Input } from '@/ui/primitives/input'

export function BlockTeamDialog({ team }: { team: SuperAdminTeam }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const listQueryKey = trpc.superAdmin.getTeams.pathKey()

  const mutate = useMutation(
    trpc.superAdmin.setTeamBlocked.mutationOptions({
      onSuccess: () => {
        toast(
          defaultSuccessToast(
            team.isBlocked ? 'Team unblocked.' : 'Team blocked.'
          )
        )
        setOpen(false)
        setReason('')
        void queryClient.invalidateQueries({ queryKey: listQueryKey })
      },
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to update team.')),
    })
  )

  // Unblock is a plain confirm; block optionally captures a reason.
  if (team.isBlocked) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="small">
            Unblock
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unblock {team.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-fg-secondary">
            This restores the team's API access.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={mutate.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                mutate.mutate({
                  teamID: team.id,
                  isBlocked: false,
                  blockedReason: null,
                })
              }
              disabled={mutate.isPending}
            >
              Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="error" size="small">
          Block
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Block {team.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fg-secondary">
          The team's API requests will be rejected with 403 until unblocked.
        </p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            mutate.mutate({
              teamID: team.id,
              isBlocked: true,
              blockedReason: reason.trim() || null,
            })
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-fg-tertiary" htmlFor="block-reason">
              Reason (optional)
            </label>
            <Input
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Abuse, non-payment, …"
              className="h-9 border-stroke"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={mutate.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="error" disabled={mutate.isPending}>
              Block team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
