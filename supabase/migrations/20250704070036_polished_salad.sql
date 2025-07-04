/*
  # Add FIDE ID field to user profiles

  1. Changes
    - Add `fide_id` column to store FIDE player ID
    - This allows linking to official FIDE database records

  2. Notes
    - FIDE ID is a unique identifier assigned by the World Chess Federation
    - It's different from FIDE rating - the ID is permanent, rating changes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'fide_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN fide_id text;
  END IF;
END $$;