/**
 * Import Module Documents
 * 
 * This script imports your 9 module documents (Module_1.docx through Module_9.docx)
 * into the modules table in your Supabase database.
 * 
 * Usage:
 *   npm run import:modules
 * 
 * Prerequisites:
 *   1. Place module documents in documents/modules/ folder
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. Run database migrations first
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ModuleContent {
  week_number: number
  title: string
  description: string
  content: {
    sections: Array<{
      heading: string
      content: string
      order: number
    }>
  }
  learning_objectives?: string[]
  estimated_duration?: string
}

async function parseModuleDocx(filePath: string): Promise<ModuleContent | null> {
  try {
    const buffer = fs.readFileSync(filePath)
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    // Extract week number from filename (e.g., "Module_1.docx" -> 1)
    const filename = path.basename(filePath, '.docx')
    const weekMatch = filename.match(/\d+/)
    const week_number = weekMatch ? parseInt(weekMatch[0]) : 0

    if (week_number === 0) {
      console.warn(`⚠️  Could not extract week number from ${filename}`)
      return null
    }

    // Parse content into sections
    // This is a basic parser - you may need to customize based on your document structure
    const lines = text.split('\n').filter(line => line.trim())
    const sections: Array<{ heading: string; content: string; order: number }> = []
    
    let currentSection = { heading: '', content: '', order: 0 }
    let sectionOrder = 0

    for (const line of lines) {
      // Detect headings (lines in ALL CAPS or with specific patterns)
      if (line.trim().length < 100 && (line === line.toUpperCase() || line.match(/^[A-Z][^.]*$/))) {
        if (currentSection.heading) {
          sections.push({ ...currentSection, order: sectionOrder++ })
        }
        currentSection = { heading: line.trim(), content: '', order: sectionOrder }
      } else {
        currentSection.content += (currentSection.content ? '\n\n' : '') + line.trim()
      }
    }

    // Add last section
    if (currentSection.heading || currentSection.content) {
      sections.push({ ...currentSection, order: sectionOrder })
    }

    // Extract title (usually first line or first heading)
    const title = sections[0]?.heading || `Module ${week_number}`
    const description = sections[0]?.content.substring(0, 200) || ''

    return {
      week_number,
      title,
      description,
      content: { sections },
      learning_objectives: [],
      estimated_duration: '4 hours'
    }
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}:`, error)
    return null
  }
}

async function importModule(moduleData: ModuleContent) {
  try {
    // Check if module already exists
    const { data: existing } = await supabase
      .from('modules')
      .select('id')
      .eq('week_number', moduleData.week_number)
      .single()

    if (existing) {
      // Update existing module
      const { error } = await supabase
        .from('modules')
        .update({
          title: moduleData.title,
          description: moduleData.description,
          content: moduleData.content
        })
        .eq('id', existing.id)

      if (error) throw error
      console.log(`✅ Updated Module ${moduleData.week_number}: ${moduleData.title}`)
    } else {
      // Create new module
      const { error } = await supabase
        .from('modules')
        .insert({
          week_number: moduleData.week_number,
          title: moduleData.title,
          description: moduleData.description,
          content: moduleData.content
        })

      if (error) throw error
      console.log(`✅ Created Module ${moduleData.week_number}: ${moduleData.title}`)
    }
  } catch (error) {
    console.error(`❌ Error importing Module ${moduleData.week_number}:`, error)
  }
}

async function main() {
  const modulesDir = path.join(process.cwd(), 'documents', 'modules')
  
  if (!fs.existsSync(modulesDir)) {
    console.error(`❌ Modules directory not found: ${modulesDir}`)
    console.log('📁 Please create documents/modules/ and place your module documents there.')
    process.exit(1)
  }

  const files = fs.readdirSync(modulesDir)
    .filter(file => file.endsWith('.docx'))
    .sort() // Sort to ensure correct order

  if (files.length === 0) {
    console.error(`❌ No .docx files found in ${modulesDir}`)
    process.exit(1)
  }

  console.log(`📚 Found ${files.length} module documents`)
  console.log('🔄 Starting import...\n')

  for (const file of files) {
    const filePath = path.join(modulesDir, file)
    console.log(`📖 Processing ${file}...`)
    
    const moduleData = await parseModuleDocx(filePath)
    if (moduleData) {
      await importModule(moduleData)
    }
  }

  console.log('\n✅ Module import complete!')
}

main().catch(console.error)
