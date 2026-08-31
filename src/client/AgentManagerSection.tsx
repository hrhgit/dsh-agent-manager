import { useEffect, useState, type ReactNode } from 'react'
import type {
  AgentManagerSnapshot, AgentManagerTool, CopyAgentPresetInput, SetAgentToolEnabledInput,
} from '../types.js'
import type { LocaleKey } from './locales.js'
import css from './AgentManagerSection.module.css'

const SELECTED_PRESET_STORAGE_KEY = 'dsh.agent-manager.settings.global.selected-preset.v1'
const PRESET_ID = /^[a-z0-9][a-z0-9-]*$/

export interface AgentManagerApi {
  readonly snapshot: (agentPreset?: string) => Promise<AgentManagerSnapshot>
  readonly setToolEnabled: (input: SetAgentToolEnabledInput) => Promise<AgentManagerSnapshot>
  readonly copyPreset: (input: CopyAgentPresetInput) => Promise<AgentManagerSnapshot>
}

export type AgentManagerSectionProps = AgentManagerApi & { readonly t: (key: LocaleKey) => string }
type LoadState = { status: 'loading' } | { status: 'ready'; snapshot: AgentManagerSnapshot } | { status: 'error'; message: string }

/** The bounded preset policy editor installed in the Settings Agent section. */
export function AgentManagerSection(api: AgentManagerSectionProps): ReactNode {
  const { t } = api
  const [selected, setSelected] = useState<string | undefined>(restoreSelectedPreset)
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [copyId, setCopyId] = useState('')
  const [copyFor, setCopyFor] = useState<string | undefined>()

  const accept = (snapshot: AgentManagerSnapshot): void => {
    setState({ status: 'ready', snapshot })
    persistSelectedPreset(snapshot.selected)
    setSelected(current => current === snapshot.selected ? current : snapshot.selected)
  }

  const load = (agentPreset = selected): void => {
    setState({ status: 'loading' })
    setFeedback(null)
    void api.snapshot(agentPreset).then(accept, error => setState({ status: 'error', message: messageOf(error) }))
  }

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    void api.snapshot(selected).then(snapshot => {
      if (active) accept(snapshot)
    }, error => {
      if (active) setState({ status: 'error', message: messageOf(error) })
    })
    return () => { active = false }
  }, [api, selected])

  useEffect(() => {
    if (state.status !== 'ready' || copyFor === state.snapshot.selected) return
    setCopyId(suggestedCopyId(state.snapshot.selected))
    setCopyFor(state.snapshot.selected)
  }, [copyFor, state])

  const toggleTool = (tool: AgentManagerTool): void => {
    if (state.status !== 'ready' || busy !== null || !state.snapshot.catalog.writable || !tool.toggleable) return
    const enabled = tool.configured !== 'enabled'
    setBusy(`tool:${tool.rowId}`)
    setFeedback(null)
    void api.setToolEnabled({ agentPreset: state.snapshot.selected, rowId: tool.rowId, enabled, expectedRevision: state.snapshot.catalog.revision }).then(snapshot => {
      accept(snapshot)
    }, error => {
      setFeedback(messageOf(error))
      void api.snapshot(state.snapshot.selected).then(accept, () => undefined)
    }).finally(() => setBusy(null))
  }

  const copyPreset = (): void => {
    if (state.status !== 'ready' || busy !== null || !state.snapshot.authorable) return
    if (!PRESET_ID.test(copyId)) {
      setFeedback(t('invalidCopyId'))
      return
    }
    setBusy('copy')
    setFeedback(null)
    void api.copyPreset({ from: state.snapshot.selected, id: copyId }).then(snapshot => {
      accept(snapshot)
    }, error => setFeedback(messageOf(error))).finally(() => setBusy(null))
  }

  if (state.status === 'loading') return <p className={css.message}>{t('loading')}</p>
  if (state.status === 'error') return <section className={css.error} role="alert"><span>{t('loadFailed')}<small>{state.message}</small></span><button type="button" className={css.button} onClick={() => load()}>{t('retry')}</button></section>

  const { snapshot } = state
  const readOnly = !snapshot.catalog.writable
  return <section className={css.root} aria-label={t('title')}>
    <header className={css.header}>
      <div><h2>{t('title')}</h2><p>{t('subtitle')}</p></div>
      <button type="button" className={css.button} disabled={busy !== null} onClick={() => load(snapshot.selected)}>{t('refresh')}</button>
    </header>
    <label className={css.presetField}>{t('preset')}
      <select value={snapshot.selected} disabled={busy !== null} onChange={event => setSelected(event.currentTarget.value)}>
        {snapshot.presets.map(preset => <option key={preset.id} value={preset.id}>{preset.name ?? preset.id}{preset.isDefault ? ` · ${t('default')}` : ''}{preset.broken === undefined ? '' : ` · ${preset.broken}`}</option>)}
      </select>
    </label>
    <p className={css.notice}>{t('applyNotice')}</p>
    {feedback === null ? null : <p className={css.feedback} role="status">{feedback}</p>}
    {readOnly ? <CopyPanel authorable={snapshot.authorable} copyId={copyId} busy={busy === 'copy'} t={t} onCopyIdChange={setCopyId} onCopy={copyPreset} /> : null}
    <ToolList catalog={snapshot.catalog} readOnly={readOnly} busy={busy} t={t} onToggle={toggleTool} />
  </section>
}

function CopyPanel({ authorable, copyId, busy, t, onCopyIdChange, onCopy }: {
  authorable: boolean
  copyId: string
  busy: boolean
  t: AgentManagerSectionProps['t']
  onCopyIdChange: (value: string) => void
  onCopy: () => void
}): ReactNode {
  return <section className={css.copyPanel}>
    <div><strong>{t('readOnlyTitle')}</strong><p>{t('readOnlyBody')}</p></div>
    {authorable ? <div className={css.copyControls}><label>{t('copyId')}<input value={copyId} disabled={busy} onChange={event => onCopyIdChange(event.currentTarget.value)} /></label><button type="button" className={`${css.button} ${css.buttonPrimary}`} disabled={busy} onClick={onCopy}>{busy ? t('copying') : t('copyPreset')}</button></div> : null}
  </section>
}

function ToolList({ catalog, readOnly, busy, t, onToggle }: {
  catalog: AgentManagerSnapshot['catalog']
  readOnly: boolean
  busy: string | null
  t: AgentManagerSectionProps['t']
  onToggle: (tool: AgentManagerTool) => void
}): ReactNode {
  if (catalog.tools.length === 0) return <p className={css.empty}>{t('noTools')}</p>
  return <ul className={css.toolList}>{catalog.tools.map(tool => {
    const checked = tool.configured === 'enabled'
    const disabled = readOnly || !tool.toggleable || busy !== null
    const action = checked ? t('toggleOn').replace('{tool}', tool.label) : t('toggleOff').replace('{tool}', tool.label)
    return <li key={tool.rowId} className={css.toolRow}>
      <div className={css.toolMain}><strong>{tool.label}</strong><code>{t('row')}: {tool.rowId}</code><div className={css.states}><span>{t('declared')}</span><span>{configuredLabel(tool, t)}</span><span>{runtimeLabel(tool, t)}</span></div></div>
      <label className={css.switch} title={disabled ? undefined : action}>
        <input type="checkbox" role="switch" checked={checked} disabled={disabled} aria-label={action} onChange={() => onToggle(tool)} />
        <span aria-hidden="true" />
      </label>
    </li>
  })}</ul>
}

function configuredLabel(tool: AgentManagerTool, t: AgentManagerSectionProps['t']): string {
  if (tool.configured === 'enabled') return t('configuredEnabled')
  if (tool.configured === 'disabled') return t('configuredDisabled')
  return t('hostControlled')
}

function runtimeLabel(tool: AgentManagerTool, t: AgentManagerSectionProps['t']): string {
  if (tool.runtime === 'available') return t('runtimeAvailable')
  if (tool.runtime === 'unavailable') return t('runtimeUnavailable')
  if (tool.runtime === 'stale') return t('runtimeStale')
  return t('runtimeNotMounted')
}

export function suggestedCopyId(source: string): string {
  return `${source}-custom`
}

export function restoreSelectedPreset(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined
  try {
    const value = localStorage.getItem(SELECTED_PRESET_STORAGE_KEY)
    return value !== null && PRESET_ID.test(value) ? value : undefined
  } catch {
    return undefined
  }
}

export function persistSelectedPreset(value: string): void {
  try { localStorage.setItem(SELECTED_PRESET_STORAGE_KEY, value) } catch { /* Browser storage must not block agent editing. */ }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
