import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/clients — list all clients for user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, emoji, business_name, website_url, created_at')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  // Get page counts per client
  const clientIds = data.map((c) => c.id)
  const { data: pageCounts } = await supabaseAdmin
    .from('content_pages')
    .select('client_id')
    .in('client_id', clientIds)

  const countMap: Record<string, number> = {}
  pageCounts?.forEach((p) => {
    countMap[p.client_id] = (countMap[p.client_id] || 0) + 1
  })

  const result = data.map((client) => ({
    ...client,
    pageCount: countMap[client.id] || 0,
  }))

  res.json(result)
})

// POST /api/clients — create a new client
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { businessName, websiteUrl, emoji } = req.body

  if (!businessName || typeof businessName !== 'string') {
    res.status(400).json({ error: 'Business name is required' })
    return
  }

  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .insert({
      user_id: req.userId!,
      business_name: businessName.trim(),
      website_url: websiteUrl?.trim() || null,
      emoji: emoji || '🏢',
    })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  // Auto-create client_settings row
  await supabaseAdmin
    .from('client_settings')
    .insert({ client_id: client.id })

  res.status(201).json(client)
})

// GET /api/clients/:id — get single client
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Client not found' })
    return
  }

  res.json(data)
})

// PATCH /api/clients/:id — update client
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { businessName, websiteUrl, emoji } = req.body

  const updates: Record<string, unknown> = {}
  if (businessName !== undefined) updates.business_name = businessName.trim()
  if (websiteUrl !== undefined) updates.website_url = websiteUrl?.trim() || null
  if (emoji !== undefined) updates.emoji = emoji

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)
    .select()
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Client not found' })
    return
  }

  res.json(data)
})

// DELETE /api/clients/:id — delete client
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { error } = await supabaseAdmin
    .from('clients')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({ deleted: true })
})

export default router
