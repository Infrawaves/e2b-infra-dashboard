import { z } from 'zod'
import { createSuperAdminRepository } from '@/core/modules/super-admin/repository.server'
import { throwTRPCErrorFromRepoError } from '@/core/server/adapters/errors'
import { withAuthedRequestRepository } from '@/core/server/api/middlewares/repository'
import { createTRPCRouter } from '@/core/server/trpc/init'
import { protectedProcedure } from '@/core/server/trpc/procedures'

const superAdminRepositoryProcedure = protectedProcedure.use(
  withAuthedRequestRepository(
    createSuperAdminRepository,
    (superAdminRepository) => ({
      superAdminRepository,
    })
  )
)

// Keyset page input for the platform-wide list views. `cursor` is required by
// tRPC's infiniteQueryOptions (nullish for the first page). `search` narrows
// the list server-side; changing it resets the infinite query to page one.
const pageInput = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
})

// Builds additionally support filtering by build status (server-side).
const buildsPageInput = pageInput.extend({
  statuses: z.array(z.enum(['building', 'failed', 'success'])).optional(),
})

// Teams support filtering by team status; templates by visibility.
const teamsPageInput = pageInput.extend({
  teamStatuses: z.array(z.enum(['active', 'blocked', 'banned'])).optional(),
})
const templatesPageInput = pageInput.extend({
  public: z.boolean().optional(),
  teamId: z.string().uuid().optional(),
  sort: z.enum(['created_at_asc', 'created_at_desc']).optional(),
})

// Snapshots support an optional team filter.
const snapshotsPageInput = pageInput.extend({
  teamId: z.string().uuid().optional(),
})

export const superAdminRouter = createTRPCRouter({
  getMe: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getMe()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getStats: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getStats()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getSandboxes: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getSandboxes()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getSnapshots: superAdminRepositoryProcedure
    .input(snapshotsPageInput)
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getSnapshots(input)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getTemplates: superAdminRepositoryProcedure
    .input(templatesPageInput)
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getTemplates(input)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getBuilds: superAdminRepositoryProcedure
    .input(buildsPageInput)
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getBuilds(input)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getTeams: superAdminRepositoryProcedure
    .input(teamsPageInput)
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getTeams(input)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getTeam: superAdminRepositoryProcedure
    .input(z.object({ teamID: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getTeam(input.teamID)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  deleteTeam: superAdminRepositoryProcedure
    .input(z.object({ teamID: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.deleteTeam(input.teamID)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getUser: superAdminRepositoryProcedure
    .input(z.object({ userID: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getUser(input.userID)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  updateTeamLimits: superAdminRepositoryProcedure
    .input(
      z.object({
        teamID: z.string().uuid(),
        limits: z.object({
          maxLengthHours: z.number().int().min(0),
          concurrentSandboxes: z.number().int().min(0),
          concurrentTemplateBuilds: z.number().int().min(0),
          maxVcpu: z.number().int().min(0),
          maxRamMb: z.number().int().min(0),
          diskMb: z.number().int().min(0),
          eventsTtlDays: z.number().int().min(0),
          defaultFreeDiskSizeMb: z.number().int().min(0),
          maxDiskSizeMb: z.number().int().min(0),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.updateTeamLimits(
        input.teamID,
        input.limits
      )
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  setTeamBlocked: superAdminRepositoryProcedure
    .input(
      z.object({
        teamID: z.string().uuid(),
        isBlocked: z.boolean(),
        blockedReason: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.setTeamBlocked(
        input.teamID,
        input.isBlocked,
        input.blockedReason ?? null
      )
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getUsers: superAdminRepositoryProcedure
    .input(pageInput)
    .query(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.getUsers(input)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  addUserToTeam: superAdminRepositoryProcedure
    .input(
      z.object({
        userID: z.string().uuid(),
        teamID: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.addUserToTeam(
        input.userID,
        input.teamID
      )
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  removeUserFromTeam: superAdminRepositoryProcedure
    .input(
      z.object({
        userID: z.string().uuid(),
        teamID: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.removeUserFromTeam(
        input.userID,
        input.teamID
      )
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  deleteUser: superAdminRepositoryProcedure
    .input(z.object({ userID: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.deleteUser(input.userID)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  getAdmins: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getAdmins()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  grantAdmin: superAdminRepositoryProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.grantAdmin(input.email)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),

  revokeAdmin: superAdminRepositoryProcedure
    .input(z.object({ userID: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.revokeAdmin(input.userID)
      if (!result.ok) throwTRPCErrorFromRepoError(result.error)
      return result.data
    }),
})
