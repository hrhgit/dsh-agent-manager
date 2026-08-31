import { describe, expect, it } from 'vitest'
import { suggestedCopyId } from '../src/client/AgentManagerSection.js'

describe('Agent Manager client state', () => {
  it('derives a writable copy id without widening the selected preset range', () => {
    expect(suggestedCopyId('standard')).toBe('standard-custom')
    expect(suggestedCopyId('coding-agent')).toBe('coding-agent-custom')
  })
})
