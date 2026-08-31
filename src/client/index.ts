import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import remoteContribution from '@hrhgit/dsh-agent-manager/remote'
import type {} from '../remote.js'
import type { AgentManagerSnapshot, CopyAgentPresetInput, SetAgentToolEnabledInput } from '../types.js'
import { AgentManagerSection, type AgentManagerApi } from './AgentManagerSection.js'
import { en, zh, type LocaleKey } from './locales.js'

interface AgentManagerRemote {
  readonly agentManager: {
    snapshot(agentPreset?: string): Promise<RemoteResult<AgentManagerSnapshot>>
    setToolEnabled(input: SetAgentToolEnabledInput): Promise<RemoteResult<AgentManagerSnapshot>>
    copyPreset(input: CopyAgentPresetInput): Promise<RemoteResult<AgentManagerSnapshot>>
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.agents': LocaleKey }
}

export const inject = ['slots', 'locale', 'remote']

export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(remoteContribution)
  const disposeLocale = ctx.locale.register('settings.agents', { zh, en })
  const feature = ctx.inject(['remote.agentManager'], (scope: ClientContext) => {
    // An external client bundle can resolve its peer's protocol declarations
    // through a different package instance than the host runtime. The mounted
    // contribution is the runtime authority; this local view keeps that seam
    // typed without depending on declaration-merging identity.
    const remote = scope.remote as unknown as AgentManagerRemote
    const api: AgentManagerApi = {
      snapshot: async (agentPreset?: string): Promise<AgentManagerSnapshot> => unwrap(await remote.agentManager.snapshot(agentPreset)),
      setToolEnabled: async (input: SetAgentToolEnabledInput): Promise<AgentManagerSnapshot> => unwrap(await remote.agentManager.setToolEnabled(input)),
      copyPreset: async (input: CopyAgentPresetInput): Promise<AgentManagerSnapshot> => unwrap(await remote.agentManager.copyPreset(input)),
    }
    const t = scope.locale.bind('settings.agents')
    return scope.slots.inject('settings.section', () => scope.slots.register({
      name: 'settings.section', id: 'dsh-agent-manager', order: 26, label: () => t('nav'), locale: 'settings.agents', inject: () => ({ ...api, t }),
    }, AgentManagerSection))
  })
  return async () => { await feature.dispose(); disposeLocale(); await disposeRemote() }
}

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: { code: string; message: string } }): T {
  if (result.ok) return result.value
  throw new Error(`${result.error.code}: ${result.error.message}`)
}

export { AgentManagerSection } from './AgentManagerSection.js'
