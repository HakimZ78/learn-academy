/**
 * Migration script to upload existing HTML materials to Supabase
 * 
 * Usage:
 * 1. Set your Supabase credentials in .env.local
 * 2. Run: node scripts/migrate-materials.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
const glob = require('glob').glob

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configuration
const MATERIALS_DIR = '/Users/hakim/Documents/Development/Tuition/Questions'
const BATCH_SIZE = 5 // Process 5 files at a time

/**
 * Parse filename to extract metadata
 */
function parseFileName(fileName) {
  const baseName = path.basename(fileName, '.html')
  
  // Extract week number
  const weekMatch = baseName.match(/week[_\s]?(\d+)/i)
  const weekNumber = weekMatch ? parseInt(weekMatch[1]) : null
  
  // Extract topic (remove week and STUDENT suffix)
  let topic = baseName
    .replace(/week[_\s]?\d+[_\s]?/i, '')
    .replace(/_STUDENT$/i, '')
    .replace(/_/g, ' ')
    .trim()
  
  // Capitalize topic
  topic = topic.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return { weekNumber, topic }
}

/**
 * Extract title from HTML content
 */
function extractTitleFromHTML(content) {
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (h1Match) {
    return h1Match[1].replace(/<[^>]*>/g, '').trim()
  }
  return null
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    console.log(`Processing: ${path.basename(filePath)}`)
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8')
    
    // Parse metadata from filename
    const { weekNumber, topic } = parseFileName(filePath)
    
    // Extract title from HTML or use topic
    const htmlTitle = extractTitleFromHTML(content)
    const title = htmlTitle || `Week ${weekNumber}: ${topic}`
    
    // Determine subject (assuming biology for now, can be enhanced)
    const subject = 'biology'
    
    // Upload file to storage
    const fileName = path.basename(filePath)
    const storagePath = `${subject}/week_${weekNumber || 'misc'}/${fileName}`
    
    const fileBuffer = Buffer.from(content)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(storagePath, fileBuffer, {
        contentType: 'text/html',
        upsert: true
      })

    if (uploadError) {
      console.error(`  ❌ Storage upload failed: ${uploadError.message}`)
      return { success: false, error: uploadError.message }
    }

    // Create database record
    const { data, error: dbError } = await supabase
      .from('materials')
      .insert({
        title,
        description: `${topic} - Pre-session questions`,
        week_number: weekNumber,
        subject,
        program_level: 'gcse', // Default to GCSE, can be adjusted
        file_path: storagePath,
        file_type: 'html',
        content_html: content,
        tags: [topic.toLowerCase(), `week${weekNumber}`],
        is_active: true
      })
      .select()
      .single()

    if (dbError) {
      console.error(`  ❌ Database insert failed: ${dbError.message}`)
      return { success: false, error: dbError.message }
    }

    console.log(`  ✅ Successfully migrated: ${title}`)
    return { success: true, data }

  } catch (error) {
    console.error(`  ❌ Error processing file: ${error.message}`)
    return { success: false, error: error.message }
  }
}

/**
 * Process files in batches
 */
async function processBatch(files) {
  const results = await Promise.all(files.map(processFile))
  return results
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting material migration...')
  console.log(`📁 Source directory: ${MATERIALS_DIR}`)
  console.log()

  try {
    // Find all STUDENT HTML files
    const pattern = path.join(MATERIALS_DIR, '*_STUDENT.html')
    const files = await glob(pattern)
    
    if (files.length === 0) {
      console.log('⚠️  No files found matching pattern: *_STUDENT.html')
      return
    }

    console.log(`📊 Found ${files.length} files to migrate`)
    console.log()

    // Process files in batches
    const results = []
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}...`)
      
      const batchResults = await processBatch(batch)
      results.push(...batchResults)
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Summary
    console.log()
    console.log('📈 Migration Summary:')
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`  ✅ Successful: ${successful}`)
    console.log(`  ❌ Failed: ${failed}`)
    
    if (failed > 0) {
      console.log()
      console.log('Failed files:')
      results.forEach((result, index) => {
        if (!result.success) {
          console.log(`  - ${path.basename(files[index])}: ${result.error}`)
        }
      })
    }

    console.log()
    console.log('✨ Migration complete!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
migrate().catch(console.error)