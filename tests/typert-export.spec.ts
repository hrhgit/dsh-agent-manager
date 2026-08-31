import { describe, expect, it } from 'vitest'

describe('Typert host export', () => {
  it('exposes an omittable selected preset to the host Loader', async () => {
    const module = await import('@hrhgit/dsh-agent-manager/typert')
    const descriptor = module.TYPERT.invocations.find(invocation => invocation.namespace === 'agentManager' && invocation.method === 'snapshot')

    expect(module.TYPERT).toMatchObject({ package: '@hrhgit/dsh-agent-manager', face: 'host' })
    expect(descriptor?.parameters).toHaveLength(1)
    expect(descriptor?.parameters[0]).toMatchObject({ name: 'agentPreset', acceptsUndefined: true })
  })
})
