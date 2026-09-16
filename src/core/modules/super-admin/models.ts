// Platform-wide (cross-team) super-admin view models.

export type PlatformRole = 'platform_admin' | 'super_admin'

// A platform admin with the profile of the user it grants the role to.
export interface PlatformAdmin {
  userID: string
  role: PlatformRole
  email: string | null
  name: string | null
  createdAt: string
}

// A running sandbox with the id of the team that owns it.
export interface SuperAdminSandbox {
  sandboxID: string
  templateID: string
  alias: string | null
  teamID: string
  cpuCount: number
  memoryMB: number
  diskSizeMB: number
  startedAt: string
  endAt: string
  state: string
}

// A template with the team that owns it.
export interface SuperAdminTemplate {
  templateID: string
  teamID: string
  teamName: string
  aliases: string[]
  cpuCount: number
  memoryMB: number
  public: boolean
  createdAt: string
  updatedAt: string
  spawnCount: number
  buildCount: number
}

// A build with the team that owns it.
export interface SuperAdminBuild {
  id: string
  templateId: string
  template: string
  teamID: string
  teamName: string
  status: string
  statusMessage: string | null
  createdAt: string
  finishedAt: string | null
}

// A platform user with the teams they belong to.
export interface SuperAdminUser {
  userID: string
  email: string | null
  name: string | null
  teams: string[]
  createdAt: string
}

// A team's editable resource quota (project_limits override).
export interface SuperAdminTeamLimits {
  maxLengthHours: number
  concurrentSandboxes: number
  concurrentTemplateBuilds: number
  maxVcpu: number
  maxRamMb: number
  diskMb: number
  eventsTtlDays: number
  defaultFreeDiskSizeMb: number
  maxDiskSizeMb: number
}

// A team as seen in the platform-wide view.
export interface SuperAdminTeam {
  id: string
  name: string
  slug: string
  tier: string
  email: string
  isBlocked: boolean
  isBanned: boolean
  blockedReason: string | null
  createdAt: string
  limits: SuperAdminTeamLimits
}
