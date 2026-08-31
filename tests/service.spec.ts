import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import AgentManagerService from '../lib/index.js'

const catalog = {
  agentPreset: 'standard', trust: 'system' as const, revision: 'one', writable: false,
  tools: [{ rowId: 'tool-fs', label: 'Filesystem', declared: true as const, configured: 'enabled' as const, toggleable: true, runtime: 'not-mounted' as const }],
}

describe('AgentManagerService', () => {
  it('reads one preset policy, delegates a scoped toggle, and selects a copied preset', async () => {
    const calls: unknown[] = []
    const ctx = new Context()
    Object.defineProperty(ctx, 'agentPresets', {
      configurable: true,
      value: {
        defaultId: 'standard', authorable: true,
        remoteExportList: async () => ({ presets: [{ id: 'standard', trust: 'system' as const, isDefault: true }, { id: 'mine', trust: 'user' as const, isDefault: false }], authorable: true }),
        inspectTools: async (id?: string) => id === 'mine' ? { ...catalog, agentPreset: 'mine', trust: 'user' as const, writable: true } : catalog,
        setToolEnabled: async (...input: unknown[]) => { calls.push(input); return { ...catalog, agentPreset: 'mine', trust: 'user' as const, writable: true } },
        copy: async (...input: unknown[]) => { calls.push(input) },
      },
    })
    const service = new AgentManagerService(ctx)

    await expect(service.snapshot()).resolves.toMatchObject({ selected: 'standard', catalog: { writable: false } })
    await expect(service.setToolEnabled({ agentPreset: 'mine', rowId: 'tool-fs', enabled: false, expectedRevision: 'one' }))
      .resolves.toMatchObject({ selected: 'mine', catalog: { writable: true } })
    await expect(service.copyPreset({ from: 'standard', id: 'mine' })).resolves.toMatchObject({ selected: 'mine' })
    expect(calls).toEqual([
      ['mine', 'tool-fs', false, 'one'],
      ['standard', 'mine', undefined],
    ])
  })
})
