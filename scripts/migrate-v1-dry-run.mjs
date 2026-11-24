import {existsSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'

const root = process.cwd()
const auditPath = resolve(root, 'docs', 'v1-audit.md')
const sourcePath = resolve(root, 'reference', 'v1')
const missing = []

if (!existsSync(auditPath)) missing.push('docs/v1-audit.md')
if (!existsSync(sourcePath)) missing.push('reference/v1/')

if (missing.length) {
  console.error(`Migration dry run is blocked: missing ${missing.join(' and ')}.`)
  console.error('No v1 content has been inferred or fabricated. Supply the audit and source export before mapping or migrating documents.')
  process.exitCode = 1
} else {
  const sourceFiles = readdirSync(sourcePath, {recursive: true}).filter((entry) => typeof entry === 'string')
  console.log(`Found the v1 audit and ${sourceFiles.length} source entries. This dry run performs no writes.`)
  console.log('Review the audit and define explicit document mappings before implementing migration writes.')
}
