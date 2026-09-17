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

export function DeleteUserDialog({
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

  const usersQueryKey = trpc.superAdmin.getUsers.queryOptions().queryKey

  const remove = useMutation(
    trpc.superAdmin.deleteUser.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('User deleted.'))
        setOpen(false)
        void queryClient.invalidateQueries({ queryKey: usersQueryKey })
      },
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to delete user.')),
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
          <DialogTitle>Delete user</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fg-secondary">
          This permanently deletes {label} and revokes their access. This cannot
          be undone.
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
            onClick={() => remove.mutate({ userID })}
            disabled={remove.isPending}
          >
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
