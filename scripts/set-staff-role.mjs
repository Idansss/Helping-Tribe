import process from 'process'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    if (!key || process.env[key] != null) continue
    let value = trimmed.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'))
loadEnvFile(path.resolve(process.cwd(), '.env'))

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return null
  return process.argv[idx + 1] ?? null
}

const email = getArg('email')
const roleArg = (getArg('role') ?? 'mentor').toLowerCase()
const role = roleArg === 'admin' ? 'admin' : 'mentor'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!email) {
  console.error('Usage: node scripts/set-staff-role.mjs --email user@domain.com [--role mentor|admin]')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 })
const user = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
if (!user) {
  console.error('No user found with email:', email)
  process.exit(1)
}

const { error: profileErr } = await supabase.from('profiles').upsert({
  id: user.id,
  role,
  full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0],
  email: user.email,
})

if (profileErr) {
  console.error('Failed to update profile:', profileErr.message)
  process.exit(1)
}

console.log(`✅ Profile updated to role: ${role}`)
console.log(`- id: ${user.id}`)
console.log(`- email: ${user.email}`)
