import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const TARGETS = ['app', 'components', 'lib', 'tests']
const EXCLUDED_DIRS = new Set(['.git', '.next', 'node_modules'])
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])

const violations = []

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        await walk(fullPath)
      }
      continue
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue
    const relativePath = path.relative(ROOT, fullPath).replaceAll('\\', '/')
    const contents = await readFile(fullPath, 'utf8')

    if (relativePath !== 'lib/server/logger.ts' && contents.includes('console.log(')) {
      violations.push(`${relativePath}: avoid console.log; use the structured logger wrapper`)
    }

    if (contents.includes('debugger')) {
      violations.push(`${relativePath}: remove debugger statements`)
    }

    if (contents.includes('@ts-ignore')) {
      violations.push(`${relativePath}: avoid @ts-ignore`)
    }
  }
}

for (const target of TARGETS) {
  await walk(path.join(ROOT, target))
}

if (violations.length > 0) {
  console.error('Lint violations found:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('Lint passed.')
