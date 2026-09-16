'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
  SuperAdminTeam,
  SuperAdminTeamLimits,
} from '@/core/modules/super-admin/models'
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

// Editable quota fields in display order, with human-readable labels.
const FIELDS: { key: keyof SuperAdminTeamLimits; label: string }[] = [
  { key: 'concurrentSandboxes', label: 'Concurrent sandboxes' },
  { key: 'concurrentTemplateBuilds', label: 'Concurrent template builds' },
  { key: 'maxVcpu', label: 'Max vCPU' },
  { key: 'maxRamMb', label: 'Max RAM (MB)' },
  { key: 'diskMb', label: 'Disk (MB)' },
  { key: 'maxDiskSizeMb', label: 'Max disk size (MB)' },
  { key: 'defaultFreeDiskSizeMb', label: 'Default free disk size (MB)' },
  { key: 'maxLengthHours', label: 'Max sandbox length (hours)' },
  { key: 'eventsTtlDays', label: 'Events TTL (days)' },
]

export function EditTeamLimitsDialog({ team }: { team: SuperAdminTeam }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<SuperAdminTeamLimits>(team.limits)

  const listQueryKey = trpc.superAdmin.getTeams.queryOptions().queryKey

  const update = useMutation(
    trpc.superAdmin.updateTeamLimits.mutationOptions({
      onSuccess: () => {
        toast(defaultSuccessToast('Team limits updated.'))
        setOpen(false)
        void queryClient.invalidateQueries({ queryKey: listQueryKey })
      },
      onError: (e) =>
        toast(defaultErrorToast(e.message || 'Failed to update limits.')),
    })
  )

  // Reset the form to the team's current limits whenever the dialog opens.
  const onOpenChange = (next: boolean) => {
    if (next) setValues(team.limits)
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="small">
          Edit limits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit limits — {team.name}</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            update.mutate({ teamID: team.id, limits: values })
          }}
        >
          {FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label
                className="text-xs text-fg-tertiary"
                htmlFor={`limit-${f.key}`}
              >
                {f.label}
              </label>
              <Input
                id={`limit-${f.key}`}
                type="number"
                min={0}
                value={values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [f.key]: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  }))
                }
                className="h-9 border-stroke"
              />
            </div>
          ))}
          <DialogFooter className="col-span-2">
            <Button type="submit" disabled={update.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
