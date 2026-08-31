/** Wire-safe agent-preset policy data owned by the Agent Manager. */

export type AgentPresetTrust = 'system' | 'user'
export type AgentToolConfiguredState = 'enabled' | 'disabled' | 'host-controlled'
export type AgentToolRuntimeState = 'not-mounted' | 'available' | 'unavailable' | 'stale'

/** One preset row available to the Agent Manager. */
export interface AgentManagerPreset {
  readonly id: string
  readonly trust: AgentPresetTrust
  readonly isDefault: boolean
  readonly name?: string
  readonly description?: string
  readonly broken?: string
}

/** One explicitly declared model-facing entry in one preset. */
export interface AgentManagerTool {
  readonly rowId: string
  readonly label: string
  readonly declared: true
  readonly configured: AgentToolConfiguredState
  readonly toggleable: boolean
  readonly runtime: AgentToolRuntimeState
}

/** The bounded tool policy read from one agent preset. */
export interface AgentManagerToolCatalog {
  readonly agentPreset: string
  readonly trust: AgentPresetTrust
  readonly revision: string
  readonly writable: boolean
  readonly tools: readonly AgentManagerTool[]
}

/** Full settings-page snapshot for one selected agent preset. */
export interface AgentManagerSnapshot {
  readonly presets: readonly AgentManagerPreset[]
  readonly authorable: boolean
  readonly selected: string
  readonly catalog: AgentManagerToolCatalog
}

/** One optimistic-locked tool toggle request. */
export interface SetAgentToolEnabledInput {
  readonly agentPreset: string
  readonly rowId: string
  readonly enabled: boolean
  readonly expectedRevision: string
}

/** Copy a source preset before changing its tool policy. */
export interface CopyAgentPresetInput {
  readonly from: string
  readonly id: string
  readonly name?: string
}
