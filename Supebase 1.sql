-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  photo_url text,
  is_pro boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  upgraded_at timestamp with time zone,
  pro_plan text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid,
  mode text NOT NULL CHECK (mode = ANY (ARRAY['focus'::text, 'shortBreak'::text, 'longBreak'::text, 'chronometer'::text])),
  duration_seconds integer NOT NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  is_completed boolean NOT NULL DEFAULT false,
  was_interrupted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT sessions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for faster user_id lookups
CREATE INDEX idx_settings_user_id ON public.settings(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER settings_updated_at_trigger
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Example data structure for settings.data JSONB column:
-- {
--   "notifications": {
--     "enabled": true,
--     "focusSound": "bell",
--     "shortBreakSound": "chime",
--     "longBreakSound": "ding",
--     "volume": 50
--   },
--   "timerDurations": {
--     "focusMinutes": 25,
--     "shortBreakMinutes": 5,
--     "longBreakMinutes": 15
--   },
--   "autoStartBreak": false,
--   "autoStartFocus": false,
--   "longBreakInterval": 4,
--   "showProgressInTitle": true,
--   "showNotificationsInTitle": true,
--   "showTickMarkers": true,
--   "themePreset": "default",
--   "background": {
--     "enabled": false,
--     "imageUrl": "",
--     "opacity": 100,
--     "blur": 0
--   },
--   "fontFamily": "inter",
--   "reduceMotion": false
-- }

-- Note: Volume is stored in the JSONB for immediate use in the app,
-- but the actual user preference is managed in localStorage on the client side.
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  description text,
  estimated_pomodoros integer DEFAULT 1,
  completed_pomodoros integer DEFAULT 0,
  priority text DEFAULT 'medium'::text,
  scheduled_date date,
  is_completed boolean DEFAULT false,
  is_chrono_log boolean DEFAULT false,
  chrono_duration_seconds integer DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);