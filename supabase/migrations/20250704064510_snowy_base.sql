/*
  # User Profiles Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `fide_rating` (integer, optional)
      - `chess_title` (text, optional - GM, IM, FM, CM, etc.)
      - `country` (text, optional)
      - `date_of_birth` (date, optional)
      - `chess_club` (text, optional)
      - `playing_style` (text, optional)
      - `favorite_opening` (text, optional)
      - `bio` (text, optional)
      - `profile_picture_url` (text, optional)
      - `onboarding_completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to manage their own profiles
    - Add policy for service role to read all profiles (for API access)
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  fide_rating integer,
  chess_title text CHECK (chess_title IN ('GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM', 'NM', 'Expert', 'Class A', 'Class B', 'Class C', 'Class D', 'Beginner')),
  country text,
  date_of_birth date,
  chess_club text,
  playing_style text CHECK (playing_style IN ('Aggressive', 'Positional', 'Tactical', 'Endgame Specialist', 'Opening Specialist', 'Balanced')),
  favorite_opening text,
  bio text,
  profile_picture_url text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can read all profiles (for API access)
CREATE POLICY "Service role can read all profiles"
  ON user_profiles
  FOR SELECT
  TO service_role
  USING (true);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, onboarding_completed)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();