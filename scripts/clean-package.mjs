import { rm } from 'node:fs/promises'

await Promise.all(['lib', 'dist'].map(path => rm(new URL(`../${path}`, import.meta.url), { recursive: true, force: true })))
