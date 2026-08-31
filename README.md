# dsh-agent-manager

DeepSeek Harness settings plugin for the tool policy of agent presets. It adds an **Agent Manager** settings section; it does not manage model providers or model metadata.

- Shows only the tools explicitly declared by the selected preset with `agentTool.label`.
- Lets a user toggle static `disabled: true` / `disabled: false` rows in a locally authored preset.
- Keeps shipped and other system-owned presets read-only, with a copy-to-user-preset path before editing.
- Shows whether a declared row is host-controlled, not mounted, available, unavailable, or stale.
- Makes clear that a policy change applies to later sessions; an existing session keeps the composition it started with.

The plugin delegates roster discovery, validation, locking, atomic writes, and runtime status to the Host's `ctx.agentPresets` service. The client retains only the currently selected preset in local browser storage.

## Compatibility

This plugin requires a DeepSeek Harness build whose `@deepseek-ai/dsh-agent-presets` service provides `inspectTools()` and `setToolEnabled()`. It is packaged as a normal DSH plugin bundle and contributes one settings section through the public client injection points.

## Declaring a tool

Preset authors opt a model-facing row into this Manager explicitly:

```yaml
- id: persistent-bash
  name: '@deepseek-ai/dsh-tool-bash-persistent'
  disabled: false
  agentTool:
    label: Persistent Bash
```

Rows without `agentTool.label` stay outside the interface, even if their package happens to provide a tool. Conditional values such as `disabled: !!js process.platform === 'win32'` remain visible as Host-controlled but are not browser-switchable.

See [README.zh-CN.md](./README.zh-CN.md) for Chinese documentation.
