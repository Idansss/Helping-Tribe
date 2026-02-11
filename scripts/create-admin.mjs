import process from 'process'
import { createClient } from '@supabase/supabase-js'

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return null
  return process.argv[idx + 1] ?? null
}

const email = getArg('email')
const password = getArg('password')
const fullName = getArg('name') ?? 'Admin'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs --email admin@example.com --password "StrongPassword123!" [--name "Full Name"]')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
})

if (createErr || !created?.user) {
  console.error('Failed to create admin auth user:', createErr?.message ?? 'unknown error')
  process.exit(1)
}

const userId = created.user.id

const { error: profileErr } = await supabase.from('profiles').upsert({
  id: userId,
  role: 'admin',
  full_name: fullName,
  email,
})

if (profileErr) {
  console.error('Admin user created, but failed to upsert profile:', profileErr.message)
  process.exit(1)
}

console.log('✅ Admin created')
console.log(`- id: ${userId}`)
console.log(`- email: ${email}`)

