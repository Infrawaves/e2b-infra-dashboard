import 'server-only'

import { authHeaders } from '@/configs/api'
import type {
  PlatformAdmin,
  PlatformRole,
  SuperAdminBuild,
  SuperAdminSandbox,
  SuperAdminTeam,
  SuperAdminTeamLimits,
  SuperAdminTemplate,
  SuperAdminUser,
} from '@/core/modules/super-admin/models'
import { api, infra } from '@/core/shared/clients/api'
import { repoErrorFromHttp } from '@/core/shared/errors'
import type { RequestScope } from '@/core/shared/repository-scope'
import { err, ok, type RepoResult } from '@/core/shared/result'

type SuperAdminRepositoryDeps = {
  apiClient: typeof api
  infraClient: typeof infra
  authHeaders: typeof authHeaders
}

// Default page size for the platform-wide list views (keyset load-more).
const LIST_LIMIT = 50

type BuildStatus = 'building' | 'failed' | 'success'
type TeamStatus = 'active' | 'blocked' | 'banned'
type PageParams = {
  cursor?: string | null
  limit?: number
  search?: string
  statuses?: BuildStatus[]
  teamStatuses?: TeamStatus[]
  public?: boolean
}

export interface SuperAdminRepository {
  getMe(): Promise<RepoResult<{ platformRole: PlatformRole | null }>>
  getSandboxes(): Promise<RepoResult<{ sandboxes: SuperAdminSandbox[] }>>
  getTemplates(
    params?: PageParams
  ): Promise<
    RepoResult<{ templates: SuperAdminTemplate[]; nextCursor: string | null }>
  >
  getBuilds(
    params?: PageParams
  ): Promise<
    RepoResult<{ builds: SuperAdminBuild[]; nextCursor: string | null }>
  >
  getTeams(
    params?: PageParams
  ): Promise<RepoResult<{ teams: SuperAdminTeam[]; nextCursor: string | null }>>
  updateTeamLimits(
    teamID: string,
    limits: SuperAdminTeamLimits
  ): Promise<RepoResult<null>>
  setTeamBlocked(
    teamID: string,
    isBlocked: boolean,
    blockedReason: string | null
  ): Promise<RepoResult<null>>
  getUsers(
    params?: PageParams
  ): Promise<RepoResult<{ users: SuperAdminUser[]; nextCursor: string | null }>>
  addUserToTeam(userID: string, teamID: string): Promise<RepoResult<null>>
  removeUserFromTeam(userID: string, teamID: string): Promise<RepoResult<null>>
  deleteUser(userID: string): Promise<RepoResult<null>>
  getAdmins(): Promise<RepoResult<{ admins: PlatformAdmin[] }>>
  grantAdmin(email: string, role: PlatformRole): Promise<RepoResult<null>>
  revokeAdmin(userID: string): Promise<RepoResult<null>>
}

export function createSuperAdminRepository(
  scope: RequestScope,
  deps: SuperAdminRepositoryDeps = {
    apiClient: api,
    infraClient: infra,
    authHeaders: authHeaders,
  }
): SuperAdminRepository {
  return {
    async getMe() {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/me',
        {
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch platform role',
            error
          )
        )
      }

      return ok({ platformRole: data?.platformRole ?? null })
    },

    async getSandboxes() {
      const { data, error, response } = await deps.infraClient.GET(
        '/super-admin/sandboxes',
        {
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch sandboxes',
            error
          )
        )
      }

      const sandboxes: SuperAdminSandbox[] = (data ?? []).map((s) => ({
        sandboxID: s.sandboxID,
        templateID: s.templateID,
        alias: s.alias ?? null,
        teamID: s.teamID,
        cpuCount: s.cpuCount,
        memoryMB: s.memoryMB,
        diskSizeMB: s.diskSizeMB,
        startedAt: s.startedAt,
        endAt: s.endAt,
        state: s.state,
      }))

      return ok({ sandboxes })
    },

    async getTemplates(params) {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/templates',
        {
          params: {
            query: {
              limit: params?.limit ?? LIST_LIMIT,
              cursor: params?.cursor ?? undefined,
              search: params?.search || undefined,
              public: params?.public,
            },
          },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch templates',
            error
          )
        )
      }

      const templates: SuperAdminTemplate[] = (data?.data ?? []).map((t) => ({
        templateID: t.templateID,
        teamID: t.teamID,
        teamName: t.teamName,
        aliases: t.aliases,
        cpuCount: t.cpuCount,
        memoryMB: t.memoryMB,
        public: t.public,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        spawnCount: t.spawnCount,
        buildCount: t.buildCount,
      }))

      return ok({ templates, nextCursor: data?.nextCursor ?? null })
    },

    async getBuilds(params) {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/builds',
        {
          params: {
            query: {
              limit: params?.limit ?? LIST_LIMIT,
              cursor: params?.cursor ?? undefined,
              search: params?.search || undefined,
              statuses: params?.statuses?.length ? params.statuses : undefined,
            },
          },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch builds',
            error
          )
        )
      }

      const builds: SuperAdminBuild[] = (data?.data ?? []).map((b) => ({
        id: b.id,
        templateId: b.templateId,
        template: b.template,
        teamID: b.teamID,
        teamName: b.teamName,
        status: b.status,
        statusMessage: b.statusMessage ?? null,
        createdAt: b.createdAt,
        finishedAt: b.finishedAt ?? null,
      }))

      return ok({ builds, nextCursor: data?.nextCursor ?? null })
    },

    async getTeams(params) {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/teams',
        {
          params: {
            query: {
              limit: params?.limit ?? LIST_LIMIT,
              cursor: params?.cursor ?? undefined,
              search: params?.search || undefined,
              statuses: params?.teamStatuses?.length
                ? params.teamStatuses
                : undefined,
            },
          },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch teams',
            error
          )
        )
      }

      const teams: SuperAdminTeam[] = (data?.data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        tier: t.tier,
        email: t.email,
        isBlocked: t.isBlocked,
        isBanned: t.isBanned,
        blockedReason: t.blockedReason ?? null,
        createdAt: t.createdAt,
        limits: {
          maxLengthHours: t.limits.maxLengthHours,
          concurrentSandboxes: t.limits.concurrentSandboxes,
          concurrentTemplateBuilds: t.limits.concurrentTemplateBuilds,
          maxVcpu: t.limits.maxVcpu,
          maxRamMb: t.limits.maxRamMb,
          diskMb: t.limits.diskMb,
          eventsTtlDays: t.limits.eventsTtlDays ?? 0,
          defaultFreeDiskSizeMb: t.limits.defaultFreeDiskSizeMb ?? 0,
          maxDiskSizeMb: t.limits.maxDiskSizeMb ?? 0,
        },
      }))

      return ok({ teams, nextCursor: data?.nextCursor ?? null })
    },

    async updateTeamLimits(teamID, limits) {
      const { error, response } = await deps.apiClient.PUT(
        '/super-admin/teams/{teamID}/limits',
        {
          params: { path: { teamID } },
          body: limits,
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to update team limits',
            error
          )
        )
      }

      return ok(null)
    },

    async setTeamBlocked(teamID, isBlocked, blockedReason) {
      const { error, response } = await deps.apiClient.PUT(
        '/super-admin/teams/{teamID}/block',
        {
          params: { path: { teamID } },
          body: { isBlocked, blockedReason },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to update team blocked state',
            error
          )
        )
      }

      return ok(null)
    },

    async getUsers(params) {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/users',
        {
          params: {
            query: {
              limit: params?.limit ?? LIST_LIMIT,
              cursor: params?.cursor ?? undefined,
              search: params?.search || undefined,
            },
          },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch users',
            error
          )
        )
      }

      const users: SuperAdminUser[] = (data?.data ?? []).map((u) => ({
        userID: u.userID,
        email: u.email ?? null,
        name: u.name ?? null,
        teams: (u.teams ?? []).map((t) => ({ teamID: t.teamID, name: t.name })),
        createdAt: u.createdAt,
      }))

      return ok({ users, nextCursor: data?.nextCursor ?? null })
    },

    async addUserToTeam(userID, teamID) {
      const { error, response } = await deps.apiClient.POST(
        '/super-admin/users/{userID}/teams',
        {
          params: { path: { userID } },
          body: { teamID },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to add user to team',
            error
          )
        )
      }

      return ok(null)
    },

    async removeUserFromTeam(userID, teamID) {
      const { error, response } = await deps.apiClient.DELETE(
        '/super-admin/users/{userID}/teams/{teamID}',
        {
          params: { path: { userID, teamID } },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to remove user from team',
            error
          )
        )
      }

      return ok(null)
    },

    async deleteUser(userID) {
      const { error, response } = await deps.apiClient.DELETE(
        '/super-admin/users/{userID}',
        {
          params: { path: { userID } },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to delete user',
            error
          )
        )
      }

      return ok(null)
    },

    async getAdmins() {
      const { data, error, response } = await deps.apiClient.GET(
        '/super-admin/admins',
        {
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to fetch admins',
            error
          )
        )
      }

      const admins: PlatformAdmin[] = (data?.data ?? []).map((a) => ({
        userID: a.userID,
        role: a.role,
        email: a.email ?? null,
        name: a.name ?? null,
        createdAt: a.createdAt,
      }))

      return ok({ admins })
    },

    async grantAdmin(email, role) {
      const { error, response } = await deps.apiClient.POST(
        '/super-admin/admins',
        {
          headers: deps.authHeaders(scope.accessToken),
          body: { email, role },
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to grant platform role',
            error
          )
        )
      }

      return ok(null)
    },

    async revokeAdmin(userID) {
      const { error, response } = await deps.apiClient.DELETE(
        '/super-admin/admins/{userID}',
        {
          params: { path: { userID } },
          headers: deps.authHeaders(scope.accessToken),
        }
      )

      if (!response.ok || error) {
        return err(
          repoErrorFromHttp(
            response.status,
            error?.message ?? 'Failed to revoke platform role',
            error
          )
        )
      }

      return ok(null)
    },
  }
}
