-- ============================================================
-- One Shot SEO — Initial Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Note: Supabase Auth manages its own auth.users table.
-- We create a public.users table that syncs via trigger.

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users (synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  device_count INTEGER DEFAULT 0
);

-- API Keys (global, per user)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  emoji TEXT DEFAULT '🏢',
  business_name TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Settings
CREATE TABLE IF NOT EXISTS public.client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  -- Basic Info
  business_address TEXT,
  gbp_raw_text TEXT,
  gbp_primary_category TEXT,
  gbp_secondary_categories TEXT,
  gbp_services TEXT,
  -- About
  about_business TEXT,
  unique_selling_points TEXT,
  credentials_awards TEXT,
  -- Voice & Tone
  tone_selections TEXT[],
  point_of_view TEXT,
  words_to_use TEXT,
  words_to_avoid TEXT,
  -- Target Audience
  target_audience TEXT,
  -- Reference Material
  writing_samples TEXT,
  onboarding_notes TEXT,
  specific_requests TEXT,
  -- Brand & CTA
  brand_primary_color TEXT DEFAULT '#2563eb',
  brand_accent_background TEXT DEFAULT '#f0f7ff',
  phone_number TEXT,
  cta_text TEXT DEFAULT 'Call now for a free estimate',
  -- Review Data
  average_rating DECIMAL(2,1),
  total_review_count INTEGER,
  review_source_url TEXT,
  -- Local Details
  local_details TEXT,
  -- Image Preferences
  default_image_style TEXT DEFAULT 'Realistic Photography',
  brand_style_guide TEXT,
  -- YouTube Connection
  youtube_client_id TEXT,
  youtube_client_secret TEXT,
  youtube_access_token TEXT,
  youtube_refresh_token TEXT,
  -- WordPress Connection
  wordpress_url TEXT,
  wordpress_username TEXT,
  wordpress_app_password TEXT,
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Results
CREATE TABLE IF NOT EXISTS public.entity_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  seed_keyword TEXT,
  city TEXT,
  candidate_entities TEXT,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GBP Audit Results
CREATE TABLE IF NOT EXISTS public.gbp_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  primary_category TEXT,
  city TEXT,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crawl Data
CREATE TABLE IF NOT EXISTS public.crawl_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  website_url TEXT,
  pages JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gap Analysis
CREATE TABLE IF NOT EXISTS public.gap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Plan
CREATE TABLE IF NOT EXISTS public.content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Content (individual pages)
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  service_name TEXT,
  city TEXT,
  slug TEXT,
  research_data JSONB,
  outline TEXT,
  article_html TEXT,
  article_plain TEXT,
  meta_title TEXT,
  meta_description TEXT,
  faq_content JSONB,
  schema_markup JSONB,
  images JSONB,
  video_script TEXT,
  video_url TEXT,
  video_youtube_id TEXT,
  ai_detection_score DECIMAL(5,2),
  humanized BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  wordpress_post_id INTEGER,
  wordpress_url TEXT,
  published_at TIMESTAMPTZ,
  parent_page_url TEXT,
  parent_wp_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk Queue
CREATE TABLE IF NOT EXISTS public.bulk_queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  content_page_id UUID REFERENCES public.content_pages(id) ON DELETE SET NULL,
  queue_position INTEGER,
  status TEXT DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  content_page_id UUID REFERENCES public.content_pages(id) ON DELETE SET NULL,
  title TEXT,
  script TEXT,
  pictory_job_id TEXT,
  video_url TEXT,
  youtube_id TEXT,
  youtube_privacy TEXT DEFAULT 'public',
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BILLING / CREDIT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  subscription_credits INTEGER DEFAULT 0,
  topup_credits INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  credit_source TEXT,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  content_page_id UUID REFERENCES public.content_pages(id) ON DELETE SET NULL,
  stripe_event_id TEXT,
  balance_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_client_settings_client_id ON public.client_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_client_id ON public.content_pages(client_id);
CREATE INDEX IF NOT EXISTS idx_bulk_queue_client_id ON public.bulk_queue_items(client_id);
CREATE INDEX IF NOT EXISTS idx_videos_client_id ON public.videos(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_event ON public.credit_transactions(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_id ON public.credit_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- ============================================================
-- AUTO-CREATE USER ROW ON SIGNUP (Supabase Auth trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- Also create a credit balance row
  INSERT INTO public.credit_balances (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only see/modify their own data
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gbp_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users: can read own row
CREATE POLICY users_select ON public.users FOR SELECT USING (auth.uid() = id);

-- API Keys: full access to own keys
CREATE POLICY api_keys_all ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- Clients: full access to own clients
CREATE POLICY clients_all ON public.clients FOR ALL USING (auth.uid() = user_id);

-- Client Settings: access via client ownership
CREATE POLICY client_settings_all ON public.client_settings FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Research: access via client ownership
CREATE POLICY entity_research_all ON public.entity_research FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY gbp_audits_all ON public.gbp_audits FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY crawl_results_all ON public.crawl_results FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY gap_analyses_all ON public.gap_analyses FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY content_plans_all ON public.content_plans FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Content pages: access via client ownership
CREATE POLICY content_pages_all ON public.content_pages FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Bulk queue: access via client ownership
CREATE POLICY bulk_queue_all ON public.bulk_queue_items FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Videos: access via client ownership
CREATE POLICY videos_all ON public.videos FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- Billing: own data only
CREATE POLICY subscriptions_all ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY credit_balances_all ON public.credit_balances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY credit_transactions_all ON public.credit_transactions FOR ALL USING (auth.uid() = user_id);
