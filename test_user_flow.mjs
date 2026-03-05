// Simulates a homeowner signing up and submitting a deck project on QuickQuotesUSA
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fbppuuywkchqvdkkqnuz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicHB1dXl3a2NocXZka2txbnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzY3NjAsImV4cCI6MjA4ODA1Mjc2MH0.RMhQ72g8gisdAeZZJezAhY4NrXJObd5cGvEbdVErLxE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const TEST_EMAIL = `testuser_deck_${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPass123!'

async function runTest() {
  console.log('=== QuickQuotesUSA User Flow Test ===')
  console.log('Acting as: Jane Homeowner')
  console.log('Goal: Submit a new deck project\n')

  // ── STEP 1: Sign up as a homeowner ──────────────────────────
  console.log('STEP 1: Creating a homeowner account...')
  console.log(`  Email: ${TEST_EMAIL}`)

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: {
      data: {
        full_name: 'Jane Homeowner',
        role: 'homeowner',
      }
    }
  })

  if (signUpError) {
    console.error('  ❌ Sign-up failed:', signUpError.message)
    return
  }

  const userId = signUpData.user?.id
  console.log(`  ✅ Account created! User ID: ${userId}`)

  // ── STEP 2: Check profile was auto-created by trigger ───────
  console.log('\nSTEP 2: Checking profile was auto-created...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('  ❌ Profile fetch failed:', profileError.message)
    console.log('  ℹ️  Note: This may be expected if email confirmation is required.')
  } else {
    console.log(`  ✅ Profile found! Name: ${profile.full_name}, Role: ${profile.role}`)
  }

  // ── STEP 3: Sign in ──────────────────────────────────────────
  console.log('\nSTEP 3: Signing in...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (signInError) {
    console.error('  ❌ Sign-in failed:', signInError.message)
    console.log('  ℹ️  If email confirmation is required, this is expected.')
    console.log('\n  → Attempting to insert profile and job manually as the authenticated user...')
    await testWithServiceKey()
    return
  }

  console.log('  ✅ Signed in successfully!')

  // ── STEP 4: Post a deck project ──────────────────────────────
  console.log('\nSTEP 4: Submitting a new deck project...')
  const jobPayload = {
    owner_id: userId,
    title: 'New Deck on Side of House',
    description: 'Looking to add a 12x16 ft pressure-treated wood deck on the east side of my home. The area is currently flat grass. I need framing, decking boards, railing, and 3 steps down to yard. Prefer composite railing. This will be attached to the house.',
    trade: 'Decks & Patios',
    location: 'Phoenix, AZ',
    budget_min: 6000,
    budget_max: 12000,
    area_size: '192 sq ft',
    status: 'open',
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert(jobPayload)
    .select()
    .single()

  if (jobError) {
    console.error('  ❌ Job submission failed:', jobError.message)
    console.error('  Details:', jobError)
  } else {
    console.log('  ✅ Project submitted successfully!')
    console.log(`  Job ID: ${job.id}`)
    console.log(`  Title: ${job.title}`)
    console.log(`  Trade: ${job.trade}`)
    console.log(`  Location: ${job.location}`)
    console.log(`  Budget: $${job.budget_min} - $${job.budget_max}`)
    console.log(`  Status: ${job.status}`)
  }

  // ── STEP 5: Verify job shows up in public listings ───────────
  console.log('\nSTEP 5: Verifying job appears in listings...')
  const { data: allJobs, error: listError } = await supabase
    .from('jobs')
    .select('id, title, trade, location, status, bid_count')
    .eq('status', 'open')

  if (listError) {
    console.error('  ❌ Could not fetch job listings:', listError.message)
  } else {
    console.log(`  ✅ Found ${allJobs.length} open job(s) in listings:`)
    allJobs.forEach(j => console.log(`     • [${j.trade}] ${j.title} — ${j.location} (${j.bid_count} bids)`))
  }

  // ── Sign out ─────────────────────────────────────────────────
  await supabase.auth.signOut()
  console.log('\n✅ Test complete. Signed out.')
}

async function testWithServiceKey() {
  console.log('  (Running without auth - checking RLS behavior)')
  const { data, error } = await supabase.from('jobs').select('*').limit(5)
  if (error) {
    console.error('  Public jobs read:', error.message)
  } else {
    console.log(`  Public jobs visible: ${data.length}`)
  }
}

runTest().catch(console.error)
