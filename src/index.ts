/** Host adapter from Agent Manager's Remote API to the Agent Presets service. */

import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  AgentManagerPreset, AgentManagerSnapshot, AgentManagerToolCatalog,
  CopyAgentPresetInput, SetAgentToolEnabledInput,
} from './types.js'

interface AgentPresetService {
  readonly defaultId: string
  readonly authorable: boolean
  remoteExportList(): Promise<{ readonly presets: readonly AgentManagerPreset[]; readonly authorable: boolean }>
  inspectTools(id?: string): Promise<AgentManagerToolCatalog>
  setToolEnabled(id: string, rowId: string, enabled: boolean, expectedRevision: string): Promise<AgentManagerToolCatalog>
  copy(from: string, id: string, name?: string): Promise<void>
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    agentPresets: AgentPresetService
    agentManager: AgentManagerService
  }
}

/** Settings-facing host service for the explicit policy that each preset owns. */
export class AgentManagerService extends TypertRemoteService {
  static inject = ['agentPresets']

  constructor(ctx: Context) {
    super(ctx, 'agentManager')
  }

  /** Read a roster and exactly one selected preset's declared tool policy. */
  @Remote('snapshot')
  async snapshot(agentPreset?: string): Promise<AgentManagerSnapshot> {
    const selected = agentPreset ?? this.ctx.agentPresets.defaultId
    assertId(selected, 'agentPreset')
    const roster = await this.ctx.agentPresets.remoteExportList()
    if (!roster.presets.some(preset => preset.id === selected)) {
      throw new Error(`Agent preset "${selected}" is no longer available. Refresh the list and choose another preset.`)
    }
    return {
      presets: roster.presets,
      authorable: roster.authorable,
      selected,
      catalog: await this.ctx.agentPresets.inspectTools(selected),
    }
  }

  /** Persist a checked, scoped enablement update and return the refreshed snapshot. */
  @Remote('setToolEnabled')
  async setToolEnabled(input: SetAgentToolEnabledInput): Promise<AgentManagerSnapshot> {
    assertId(input.agentPreset, 'agentPreset')
    assertId(input.rowId, 'rowId')
    if (input.expectedRevision.length === 0) throw new Error('The preset revision is required. Refresh the preset before changing a tool.')
    await this.ctx.agentPresets.setToolEnabled(input.agentPreset, input.rowId, input.enabled, input.expectedRevision)
    return await this.snapshot(input.agentPreset)
  }

  /** Copy a preset into the host-owned writable root before editing it. */
  @Remote('copyPreset')
  async copyPreset(input: CopyAgentPresetInput): Promise<AgentManagerSnapshot> {
    assertId(input.from, 'from')
    assertId(input.id, 'id')
    await this.ctx.agentPresets.copy(input.from, input.id, input.name)
    return await this.snapshot(input.id)
  }
}

function assertId(value: string, field: string): void {
  if (value.trim().length === 0) throw new Error(`${field} must be a non-empty preset or entry id`)
}

export default AgentManagerService
