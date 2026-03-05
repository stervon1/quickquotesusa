// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Replace the two values below with your Supabase project credentials.
// Find them at: https://supabase.com/dashboard → your project → Settings → API
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── AUTH ─────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

// ── PROFILES ─────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  await updateProfile(userId, { avatar_url: data.publicUrl })
  return data.publicUrl
}

// ── JOBS ─────────────────────────────────────────────────────

export async function getJobs({ trade, location, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('jobs')
    .select(`
      id, title, description, trade, location, budget_min, budget_max,
      area_size, status, bid_count, quote_request_count, created_at,
      owner:profiles(id, full_name, avatar_url, location, rating),
      photos:job_photos(url, order_index)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (trade && trade !== 'All') query = query.eq('trade', trade)
  if (location) query = query.ilike('location', `%${location}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getJob(jobId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      owner:profiles(id, full_name, avatar_url, location, rating, review_count),
      photos:job_photos(url, order_index)
    `)
    .eq('id', jobId)
    .single()
  if (error) throw error
  return data
}

export async function getMyJobs(userId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`*, quote_request_count, photos:job_photos(url, order_index), bids(id, status)`)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createJob({ ownerId, title, description, trade, location, budgetMin, budgetMax, areaSize }) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      owner_id: ownerId,
      title,
      description,
      trade,
      location,
      budget_min: budgetMin,
      budget_max: budgetMax,
      area_size: areaSize,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadJobPhotos(jobId, files) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const path = `${jobId}/${Date.now()}-${i}.${ext}`
    const { error } = await supabase.storage.from('job-photos').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('job-photos').getPublicUrl(path)
    await supabase.from('job_photos').insert({ job_id: jobId, url: data.publicUrl, order_index: i })
    urls.push(data.publicUrl)
  }
  return urls
}

export async function updateJobStatus(jobId, status) {
  const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId)
  if (error) throw error
}

// ── BIDS ─────────────────────────────────────────────────────

export async function getBidsForJob(jobId) {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      contractor:profiles(id, full_name, avatar_url, company_name, trade, rating, review_count, jobs_completed, is_insured)
    `)
    .eq('job_id', jobId)
    .order('amount', { ascending: true })
  if (error) throw error
  return data
}

export async function getMyBids(contractorId) {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      job:jobs(id, title, trade, location, budget_min, budget_max, status,
        owner:profiles(full_name, avatar_url))
    `)
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function submitBid({ jobId, contractorId, amount, timeline, message }) {
  const { data, error } = await supabase
    .from('bids')
    .insert({ job_id: jobId, contractor_id: contractorId, amount, timeline, message })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBidStatus(bidId, status) {
  const { data, error } = await supabase
    .from('bids')
    .update({ status })
    .eq('id', bidId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── PORTFOLIO ────────────────────────────────────────────────

export async function getPortfolio(contractorId) {
  const { data, error } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('order_index')
  if (error) throw error
  return data
}

export async function uploadPortfolioPhoto(contractorId, file, caption = '') {
  const ext = file.name.split('.').pop()
  const path = `${contractorId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('portfolio').upload(path, file)
  if (error) throw error
  const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path)
  const { data, error: dbError } = await supabase
    .from('portfolio_photos')
    .insert({ contractor_id: contractorId, url: urlData.publicUrl, caption })
    .select()
    .single()
  if (dbError) throw dbError
  return data
}

// ── REVIEWS ──────────────────────────────────────────────────

export async function getReviews(contractorId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles(full_name, avatar_url)`)
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function submitReview({ jobId, reviewerId, contractorId, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ job_id: jobId, reviewer_id: reviewerId, contractor_id: contractorId, rating, comment })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── CONTRACTORS ──────────────────────────────────────────────

export async function getTopContractors(trade, limit = 5) {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'contractor')
    .order('rating', { ascending: false })
    .limit(limit)
  if (trade && trade !== 'All') query = query.eq('trade', trade)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ── QUOTE REQUESTS (R2Q) ────────────────────────────────────

export async function sendQuoteRequest({ jobId, contractorId, message }) {
  // Deduct 1 quote credit
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('quote_credits_used, quote_credits_limit')
    .eq('id', contractorId)
    .single()
  if (profileError) throw profileError
  if (profile.quote_credits_used >= profile.quote_credits_limit) {
    throw new Error('No quote credits remaining. Please upgrade your plan.')
  }

  // Insert quote request
  const { data, error } = await supabase
    .from('quote_requests')
    .insert({ job_id: jobId, contractor_id: contractorId, message })
    .select()
    .single()
  if (error) throw error

  // Increment credits used
  await supabase
    .from('profiles')
    .update({ quote_credits_used: profile.quote_credits_used + 1 })
    .eq('id', contractorId)

  return data
}

export async function getQuoteRequestsForJob(jobId) {
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      contractor:profiles(id, full_name, avatar_url, company_name, trade, rating, review_count, jobs_completed, is_insured, location)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getMyQuoteRequests(contractorId) {
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      job:jobs(id, title, trade, location, budget_min, budget_max, status,
        owner:profiles(id, full_name, avatar_url))
    `)
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateQuoteRequestStatus(requestId, status) {
  const updates = { status }
  if (status === 'approved') updates.chat_enabled = true
  const { data, error } = await supabase
    .from('quote_requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getContractor(contractorId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', contractorId)
    .single()
  if (error) throw error
  return data
}
