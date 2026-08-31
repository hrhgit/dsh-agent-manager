export const zh = {
  nav: '智能体', title: '智能体工具', subtitle: '只显示当前智能体预设明确声明的工具；不会从全局工具列表中添加工具。', loading: '正在读取智能体预设...', retry: '重试', refresh: '刷新', loadFailed: '暂时无法读取智能体配置。',
  preset: '智能体预设', default: '默认', declared: '已声明', row: '配置行', configuredEnabled: '用户已启用', configuredDisabled: '用户已关闭', hostControlled: '由宿主条件控制',
  runtimeAvailable: '当前运行时可用', runtimeUnavailable: '当前运行时不可用', runtimeNotMounted: '尚未挂载，下一次新会话生效', runtimeStale: '已有会话仍在使用旧配置', applyNotice: '工具开关写入预设文件。已经开始的会话保持原有工具；新会话会使用新的配置。',
  readOnlyTitle: '此预设由宿主提供，不能直接修改。', readOnlyBody: '创建副本后，可在副本的已声明工具范围内开关。', copyId: '副本标识', copyPreset: '创建可编辑副本', copying: '正在创建副本', invalidCopyId: '副本标识只能使用小写字母、数字和连字符，并且不能以连字符开头或结尾。',
  noTools: '此预设没有声明可由 Agent Manager 管理的工具。', operationFailed: '操作失败，请刷新后重试。', toggleOn: '关闭 {tool}', toggleOff: '开启 {tool}', refreshRequired: '配置已变化，已重新读取最新内容。',
} as const

export type LocaleKey = keyof typeof zh

export const en: Record<LocaleKey, string> = {
  nav: 'Agents', title: 'Agent tools', subtitle: 'Only tools explicitly declared by this agent preset are shown. This page never adds a tool from the global directory.', loading: 'Reading agent presets...', retry: 'Retry', refresh: 'Refresh', loadFailed: 'Agent configuration is temporarily unavailable.',
  preset: 'Agent preset', default: 'Default', declared: 'Declared', row: 'Configuration row', configuredEnabled: 'Enabled by user', configuredDisabled: 'Disabled by user', hostControlled: 'Controlled by host condition',
  runtimeAvailable: 'Available in the current runtime', runtimeUnavailable: 'Unavailable in the current runtime', runtimeNotMounted: 'Not mounted; applies to the next new session', runtimeStale: 'Existing sessions still use the old configuration', applyNotice: 'Tool switches are written to the preset file. Started sessions keep their tools; new sessions use the updated configuration.',
  readOnlyTitle: 'This preset is supplied by the host and cannot be edited directly.', readOnlyBody: 'Create a copy to switch tools within its declared range.', copyId: 'Copy id', copyPreset: 'Create editable copy', copying: 'Creating copy', invalidCopyId: 'A copy id uses lowercase letters, numbers, and hyphens, without a leading or trailing hyphen.',
  noTools: 'This preset declares no tools that Agent Manager can manage.', operationFailed: 'The operation failed. Refresh and try again.', toggleOn: 'Disable {tool}', toggleOff: 'Enable {tool}', refreshRequired: 'The configuration changed, so the latest content was reloaded.',
}
