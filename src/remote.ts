import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'
import type {
  AgentManagerSnapshot, CopyAgentPresetInput, SetAgentToolEnabledInput,
} from './types.js'

const preset = z.object({
  id: z.string(), trust: z.enum(['system', 'user']), isDefault: z.boolean(), name: z.string().optional(), description: z.string().optional(), broken: z.string().optional(),
}).readonly()
const tool = z.object({
  rowId: z.string(), label: z.string(), declared: z.literal(true), configured: z.enum(['enabled', 'disabled', 'host-controlled']), toggleable: z.boolean(), runtime: z.enum(['not-mounted', 'available', 'unavailable', 'stale']),
}).readonly()
const catalog = z.object({
  agentPreset: z.string(), trust: z.enum(['system', 'user']), revision: z.string(), writable: z.boolean(), tools: z.array(tool).readonly(),
}).readonly()
const snapshot = z.object({
  presets: z.array(preset).readonly(), authorable: z.boolean(), selected: z.string(), catalog,
}).readonly()
const setToolEnabled = z.object({ agentPreset: z.string(), rowId: z.string(), enabled: z.boolean(), expectedRevision: z.string() }).readonly()
const copyPreset = z.object({ from: z.string(), id: z.string(), name: z.string().optional() }).readonly()
const strict = (typeSymbol: string, schema: z.ZodType) => ({ mode: 'strict' as const, typeSymbol, schema })
const parameter = (name: string, schema: z.ZodType, acceptsUndefined?: true) => ({
  name, wire: name, source: 'json' as const,
  ...(acceptsUndefined === true ? { acceptsUndefined: true as const } : {}),
  codec: strict(`@hrhgit/dsh-agent-manager/types#${name}`, schema),
})
type Parameter = ReturnType<typeof parameter>
const descriptor = (method: string, parameters: readonly Parameter[], result: z.ZodType, resultType: string) => ({ id: `@hrhgit/dsh-agent-manager#agentManager/${method}`, service: 'agentManager', namespace: 'agentManager', method, invocation: { kind: 'direct' as const }, parameters, result: strict(`@hrhgit/dsh-agent-manager/types#${resultType}`, result) })
const descriptors = [
  descriptor('snapshot', [parameter('agentPreset', z.string().optional(), true)], snapshot, 'AgentManagerSnapshot'),
  descriptor('setToolEnabled', [parameter('input', setToolEnabled)], snapshot, 'AgentManagerSnapshot'),
  descriptor('copyPreset', [parameter('input', copyPreset)], snapshot, 'AgentManagerSnapshot'),
] as const

export const TYPERT_REMOTE: TypertRemoteContribution = { package: '@hrhgit/dsh-agent-manager', descriptors }
export const TYPERT = { package: '@hrhgit/dsh-agent-manager', face: 'host', schemas: [], invocations: descriptors, model: { services: [], events: [], objects: [] } }

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteMap {
    'agentManager/snapshot': (agentPreset?: string) => Promise<RemoteResult<AgentManagerSnapshot>>
    'agentManager/setToolEnabled': (input: SetAgentToolEnabledInput) => Promise<RemoteResult<AgentManagerSnapshot>>
    'agentManager/copyPreset': (input: CopyAgentPresetInput) => Promise<RemoteResult<AgentManagerSnapshot>>
  }
  interface TypertRemoteNamespaceMap {
    agentManager: {
      snapshot: (agentPreset?: string) => Promise<RemoteResult<AgentManagerSnapshot>>
      setToolEnabled: (input: SetAgentToolEnabledInput) => Promise<RemoteResult<AgentManagerSnapshot>>
      copyPreset: (input: CopyAgentPresetInput) => Promise<RemoteResult<AgentManagerSnapshot>>
    }
  }
}

export default TYPERT_REMOTE
