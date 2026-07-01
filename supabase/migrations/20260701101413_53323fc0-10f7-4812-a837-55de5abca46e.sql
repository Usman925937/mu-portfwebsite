
-- 1) Table storing 2FA/enrollment/lockout state per admin user.
CREATE TABLE public.admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  totp_secret_enc text,          -- base64(iv || ciphertext || tag), encrypted with ADMIN_TOTP_ENC_KEY
  totp_enabled boolean NOT NULL DEFAULT false,
  backup_codes_hashed text[] NOT NULL DEFAULT '{}', -- sha256 hex of each single-use backup code
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Users may read/update ONLY their own profile row. Writes/inserts also allowed only for self.
CREATE POLICY "admins read own profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins insert own profile"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins update own profile"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER admin_profiles_touch_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Promote a user to admin. Only current admins may call.
CREATE OR REPLACE FUNCTION public.promote_to_admin(_target uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (_target, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

-- 3) Convenience: does current user have 2FA enabled?
CREATE OR REPLACE FUNCTION public.current_admin_has_totp()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT totp_enabled FROM public.admin_profiles WHERE user_id = auth.uid()),
    false
  );
$$;
