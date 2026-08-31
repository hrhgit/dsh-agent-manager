import { readFile } from 'node:fs/promises'

const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
if (!bundle.includes('window.__ModuleLoader__.load')) throw new Error('dsh-agent-manager: client bundle is not registered with the DSH module loader')
