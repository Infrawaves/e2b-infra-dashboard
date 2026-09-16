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

export const superAdminRouter = createTRPCRouter({
  getMe: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getMe()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getSandboxes: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getSandboxes()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getTemplates: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getTemplates()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getBuilds: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getBuilds()
    if (!result.ok) throwTRPCErrorFromRepoError(result.error)
    return result.data
  }),

  getTeams: superAdminRepositoryProcedure.query(async ({ ctx }) => {
    const result = await ctx.superAdminRepository.getTeams()
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
        role: z.enum(['platform_admin', 'super_admin']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.superAdminRepository.grantAdmin(
        input.email,
        input.role
      )
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
