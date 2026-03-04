import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { encrypt, decrypt, maskKey } from '../lib/encryption.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const VALID_SERVICES = [
  'anthropic',
  'openai',
  'dataforseo_login',
  'dataforseo_password',
  'pictory_client_id',
  'pictory_client_secret',
  'zerogpt',
  'google_oauth_client_id',
  'google_oauth_client_secret',
] as const

// GET /api/api-keys — list all keys (masked)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, service, encrypted_value, updated_at')
    .eq('user_id', req.userId!)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const keys = data.map((key) => ({
    id: key.id,
    service: key.service,
    maskedValue: maskKey(decrypt(key.encrypted_value)),
    updatedAt: key.updated_at,
  }))

  // Return status for all services (set or not set)
  const result = VALID_SERVICES.map((service) => {
    const existing = keys.find((k) => k.service === service)
    return {
      service,
      isSet: !!existing,
      maskedValue: existing?.maskedValue || null,
      updatedAt: existing?.updatedAt || null,
    }
  })

  res.json(result)
})

// PUT /api/api-keys/:service — set or update a key
router.put('/:service', requireAuth, async (req: AuthRequest, res) => {
  const { service } = req.params
  const { value } = req.body

  if (!VALID_SERVICES.includes(service as typeof VALID_SERVICES[number])) {
    res.status(400).json({ error: `Invalid service: ${service}` })
    return
  }

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    res.status(400).json({ error: 'Value is required' })
    return
  }

  const encryptedValue = encrypt(value.trim())

  const { error } = await supabaseAdmin
    .from('api_keys')
    .upsert(
      {
        user_id: req.userId!,
        service,
        encrypted_value: encryptedValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,service' }
    )

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({ service, maskedValue: maskKey(value.trim()) })
})

// DELETE /api/api-keys/:service — remove a key
router.delete('/:service', requireAuth, async (req: AuthRequest, res) => {
  const { service } = req.params

  const { error } = await supabaseAdmin
    .from('api_keys')
    .delete()
    .eq('user_id', req.userId!)
    .eq('service', service)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({ deleted: true })
})

export default router
