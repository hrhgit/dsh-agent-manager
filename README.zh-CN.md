# dsh-agent-manager

DeepSeek Harness 的智能体预设工具策略设置插件。它会添加一个独立的 **Agent Manager** 设置区，不管理模型提供方或模型元数据。

- 只展示所选 preset 通过 `agentTool.label` 显式声明的工具。
- 允许用户切换本地创作 preset 中静态的 `disabled: true` / `disabled: false` 行。
- 随附 preset 与其他系统拥有的 preset 保持只读；先复制为 user preset 后才可编辑。
- 展示已声明行是 Host 控制、未挂载、可用、不可用还是 stale。
- 明确提示策略变更只作用于后续会话；已有会话保留创建时的组装。

插件把名单发现、校验、锁、原子写入和运行时状态全部委托给 Host 的 `ctx.agentPresets` 服务。Client 只在浏览器本地存储当前选中的 preset。

## 兼容性

本插件需要 `@deepseek-ai/dsh-agent-presets` 服务已提供 `inspectTools()` 与 `setToolEnabled()` 的 DeepSeek Harness 构建。它按普通 DSH 插件 bundle 打包，并通过公开的 Client injection point 贡献一个设置区。

## 声明工具

preset 作者需要显式让某一行加入这个 Manager：

```yaml
- id: persistent-bash
  name: '@deepseek-ai/dsh-tool-bash-persistent'
  disabled: false
  agentTool:
    label: Persistent Bash
```

即使其包碰巧提供工具，没有 `agentTool.label` 的行也不会出现在界面中。`disabled: !!js process.platform === 'win32'` 这类条件值会展示为由 Host 控制，但不能在浏览器中切换。

英文文档见 [README.md](./README.md)。
