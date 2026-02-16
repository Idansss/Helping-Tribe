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

function env(name, fallback = '') {
  return process.env[name] ?? fallback
}

function truthy(value, defaultValue = false) {
  if (value == null || value === '') return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase())
}

function toEmailSet(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  )
}

function chunk(values, size = 100) {
  const out = []
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size))
  return out
}

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    error?.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('relation') ||
    message.includes('could not find the table') ||
    message.includes('schema cache')
  )
}

const TABLE_DELETE_COLUMN = {
  matric_sequences: 'year',
}

function deleteColumnForTable(table) {
  return TABLE_DELETE_COLUMN[table] || 'id'
}

async function countRows(supabase, table) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) {
    if (isMissingTableError(error)) return null
    throw error
  }
  return count ?? 0
}

async function deleteAllRows(supabase, table) {
  const before = await countRows(supabase, table)
  if (before === null) {
    return { table, skipped: true, reason: 'missing table', before: null, deleted: 0, after: null }
  }

  const deleteColumn = deleteColumnForTable(table)
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .not(deleteColumn, 'is', null)
  if (error) {
    if (isMissingTableError(error)) {
      return { table, skipped: true, reason: 'missing table', before, deleted: 0, after: before }
    }
    throw error
  }

  const after = await countRows(supabase, table)
  return {
    table,
    skipped: false,
    reason: null,
    before,
    deleted: count ?? Math.max(0, before - (after ?? 0)),
    after,
  }
}

async function deleteByIds(supabase, table, ids) {
  if (!ids.length) {
    const before = await countRows(supabase, table)
    return {
      table,
      skipped: false,
      reason: 'no matching rows',
      before,
      deleted: 0,
      after: before,
    }
  }

  const before = await countRows(supabase, table)
  if (before === null) {
    return { table, skipped: true, reason: 'missing table', before: null, deleted: 0, after: null }
  }

  let deleted = 0
  for (const idChunk of chunk(ids, 200)) {
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .in('id', idChunk)

    if (error) throw error
    deleted += count ?? 0
  }

  const after = await countRows(supabase, table)
  return { table, skipped: false, reason: null, before, deleted, after }
}

async function listAllAuthUsers(supabase) {
  const users = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const rows = data?.users ?? []
    users.push(...rows)
    if (rows.length < perPage) break
    page += 1
  }

  return users
}

async function ensurePrimaryAdmin(supabase, primaryAdminEmail, primaryAdminName, primaryAdminPassword) {
  const normalizedEmail = primaryAdminEmail?.trim().toLowerCase()
  if (!normalizedEmail) return null

  const users = await listAllAuthUsers(supabase)
  const existing = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail)

  let adminUser = existing
  if (!adminUser) {
    if (!primaryAdminPassword) {
      throw new Error(
        `Primary admin ${normalizedEmail} does not exist. Set RESET_ADMIN_PASSWORD to create it.`
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: primaryAdminPassword,
      email_confirm: true,
      user_metadata: { full_name: primaryAdminName || 'Platform Admin' },
    })

    if (error || !data?.user) {
      throw new Error(`Failed creating primary admin ${normalizedEmail}: ${error?.message || 'unknown error'}`)
    }

    adminUser = data.user
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: adminUser.id,
    role: 'admin',
    full_name: primaryAdminName || adminUser.user_metadata?.full_name || 'Platform Admin',
    email: normalizedEmail,
  })

  if (profileError) {
    throw new Error(`Failed to upsert profile for ${normalizedEmail}: ${profileError.message}`)
  }

  return {
    id: adminUser.id,
    email: normalizedEmail,
  }
}

async function clearStorageBuckets(supabase, dryRun) {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(`Failed listing storage buckets: ${error.message}`)

  const names = (buckets ?? []).map((b) => b.name)
  if (!names.length) {
    return { buckets: [], cleared: 0 }
  }

  let cleared = 0
  if (!dryRun) {
    for (const bucket of buckets) {
      const { error: emptyError } = await supabase.storage.emptyBucket(bucket.name)
      if (emptyError) {
        throw new Error(`Failed clearing bucket ${bucket.name}: ${emptyError.message}`)
      }
      cleared += 1
    }
  }

  return { buckets: names, cleared: dryRun ? 0 : cleared }
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), '.env.local'))
  loadEnvFile(path.resolve(process.cwd(), '.env'))

  const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL') || env('SUPABASE_URL')
  const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SERVICE_ROLE')

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE')
  }

  const confirm = env('CONFIRM')
  if (confirm !== 'YES') {
    throw new Error('Safety check failed. Re-run with CONFIRM=YES')
  }

  const dryRun = truthy(env('DRY_RUN'), false)
  const wipeReferenceData = truthy(env('WIPE_REFERENCE_DATA'), false)
  const preserveStaff = truthy(env('RESET_PRESERVE_STAFF'), true)
  const clearStorage = truthy(env('RESET_CLEAR_STORAGE'), true)

  const primaryAdminEmail = env('RESET_ADMIN_EMAIL').trim().toLowerCase()
  const primaryAdminName = env('RESET_ADMIN_NAME', 'Platform Admin')
  const primaryAdminPassword = env('RESET_ADMIN_PASSWORD')

  const extraKeepEmails = toEmailSet(env('RESET_KEEP_AUTH_EMAILS'))
  if (primaryAdminEmail) extraKeepEmails.add(primaryAdminEmail)

  const host = new URL(supabaseUrl).hostname
  const projectRef = host.split('.')[0]

  console.log('--- Reset Test Data ---')
  console.log(`Target host: ${host}`)
  console.log(`Project ref: ${projectRef}`)
  console.log(`Dry run: ${dryRun ? 'YES' : 'NO'}`)
  console.log(`Wipe reference content: ${wipeReferenceData ? 'YES' : 'NO'}`)
  console.log(`Preserve staff accounts: ${preserveStaff ? 'YES' : 'NO'}`)
  console.log(`Clear storage buckets: ${clearStorage ? 'YES' : 'NO'}`)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const primaryAdmin = await ensurePrimaryAdmin(
    supabase,
    primaryAdminEmail,
    primaryAdminName,
    primaryAdminPassword
  )

  const keepUserIds = new Set()
  const keepEmails = new Set(extraKeepEmails)

  if (primaryAdmin) {
    keepUserIds.add(primaryAdmin.id)
    keepEmails.add(primaryAdmin.email)
  }

  const { data: profileRows, error: profileListError } = await supabase
    .from('profiles')
    .select('id, email, role')

  if (profileListError && !isMissingTableError(profileListError)) {
    throw new Error(`Failed loading profiles: ${profileListError.message}`)
  }

  const rows = profileRows ?? []
  if (preserveStaff) {
    for (const row of rows) {
      const role = String(row.role || '').toLowerCase()
      if (role === 'admin' || role === 'faculty' || role === 'mentor') {
        if (row.id) keepUserIds.add(row.id)
        if (row.email) keepEmails.add(String(row.email).toLowerCase())
      }
    }
  }

  if (!keepUserIds.size) {
    throw new Error(
      'No staff/admin account is marked to keep. Set RESET_ADMIN_EMAIL (and RESET_ADMIN_PASSWORD if creating) before running.'
    )
  }

  console.log(`Preserving ${keepUserIds.size} auth/profile account(s).`)

  const tableOps = []

  const transactionalTables = [
    'email_outbox',
    'application_drafts',
    'payments',
    'password_setup_tokens',
    'students',
    'applicants',
    'notifications',
    'messages',
    'quiz_question_responses',
    'quiz_attempts',
    'module_progress',
    'user_progress',
    'learning_journals',
    'final_exam_submissions',
    'certificates',
    'assignment_submissions',
    'assessment_responses',
    'discussion_responses',
    'case_study_responses',
    'final_project_feedback',
    'final_project_submissions',
    'peer_circle_presentations',
    'peer_circle_sessions',
    'peer_circle_members',
    'ai_client_sessions',
    'voice_notes',
    'user_badges',
    'bookmarks',
    'backpack_items',
    'whatsapp_preferences',
    'user_activity',
    'grounding_tool_usage',
    'peer_reviews',
    'matric_sequences',
  ]

  const referenceTables = [
    'final_projects',
    'assignments',
    'assessment_tools',
    'discussion_prompts',
    'case_studies',
    'quizzes',
    'quick_reference_tools',
    'resources',
    'weekly_events',
    'lessons',
    'modules',
    'faculty',
    'cohorts',
    'badges',
  ]

  for (const table of transactionalTables) {
    if (dryRun) {
      const before = await countRows(supabase, table)
      tableOps.push({ table, skipped: before === null, reason: before === null ? 'missing table' : 'dry-run', before, deleted: 0, after: before })
      continue
    }

    const result = await deleteAllRows(supabase, table)
    tableOps.push(result)
  }

  if (wipeReferenceData) {
    for (const table of referenceTables) {
      if (dryRun) {
        const before = await countRows(supabase, table)
        tableOps.push({ table, skipped: before === null, reason: before === null ? 'missing table' : 'dry-run (reference)', before, deleted: 0, after: before })
        continue
      }
      const result = await deleteAllRows(supabase, table)
      tableOps.push(result)
    }
  }

  const profileIdsToDelete = rows
    .filter((row) => row?.id && !keepUserIds.has(row.id))
    .map((row) => row.id)

  if (dryRun) {
    const before = await countRows(supabase, 'profiles')
    const after = before == null ? null : before - profileIdsToDelete.length
    tableOps.push({
      table: 'profiles',
      skipped: before === null,
      reason: before === null ? 'missing table' : 'dry-run (preserving staff/admin)',
      before,
      deleted: 0,
      after,
    })
  } else {
    const result = await deleteByIds(supabase, 'profiles', profileIdsToDelete)
    tableOps.push({ ...result, reason: 'preserving staff/admin' })
  }

  let deletedAuthUsers = 0
  let totalAuthUsers = 0

  const users = await listAllAuthUsers(supabase)
  totalAuthUsers = users.length

  if (!dryRun) {
    for (const user of users) {
      const email = String(user.email || '').toLowerCase()
      if (keepUserIds.has(user.id) || keepEmails.has(email)) continue

      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        throw new Error(`Failed deleting auth user ${user.id} (${email || 'no-email'}): ${error.message}`)
      }
      deletedAuthUsers += 1
    }
  }

  let storageSummary = { buckets: [], cleared: 0 }
  if (clearStorage) {
    storageSummary = await clearStorageBuckets(supabase, dryRun)
  }

  console.log('')
  console.log('Table cleanup summary:')
  for (const op of tableOps) {
    if (op.skipped) {
      console.log(`- ${op.table}: skipped (${op.reason})`)
      continue
    }
    console.log(`- ${op.table}: before=${op.before ?? 0}, deleted=${op.deleted ?? 0}, after=${op.after ?? 0}${op.reason ? ` (${op.reason})` : ''}`)
  }

  const preservedUsers = users.filter((u) => keepUserIds.has(u.id) || keepEmails.has(String(u.email || '').toLowerCase()))

  console.log('')
  console.log('Auth cleanup summary:')
  console.log(`- total users: ${totalAuthUsers}`)
  console.log(`- deleted users: ${dryRun ? 0 : deletedAuthUsers}`)
  console.log(`- preserved users: ${preservedUsers.length}`)

  if (preservedUsers.length) {
    console.log('- preserved emails:')
    for (const user of preservedUsers) {
      console.log(`  - ${user.email || '(no email)'} (${user.id})`)
    }
  }

  if (clearStorage) {
    console.log('')
    console.log('Storage cleanup summary:')
    if (!storageSummary.buckets.length) {
      console.log('- no buckets found')
    } else {
      console.log(`- buckets discovered: ${storageSummary.buckets.join(', ')}`)
      console.log(`- buckets cleared: ${dryRun ? 0 : storageSummary.cleared}`)
    }
  }

  if (dryRun) {
    console.log('')
    console.log('Dry run complete. Re-run with DRY_RUN=0 (or unset) to execute deletion.')
  } else {
    console.log('')
    console.log('Reset complete.')
  }
}

main().catch((error) => {
  console.error('Reset failed:', error?.message || error)
  process.exit(1)
})
