/*
  # Email Classification System Schema

  1. New Tables
    - `emails`
      - `id` (uuid, primary key) - Unique identifier for each email
      - `content` (text) - The email content/body
      - `filename` (text, nullable) - Original filename if uploaded as file
      - `category` (text) - Classification result: 'Produtivo' or 'Improdutivo'
      - `suggested_response` (text) - AI-generated response suggestion
      - `processing_status` (text) - Status: 'pending', 'processing', 'completed', 'error'
      - `error_message` (text, nullable) - Error details if processing failed
      - `created_at` (timestamptz) - Timestamp of email submission
      - `processed_at` (timestamptz, nullable) - Timestamp of completion

  2. Security
    - Enable RLS on `emails` table
    - Add policy for anyone to insert emails (public submission)
    - Add policy for anyone to read their submitted emails
*/

CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  filename text,
  category text,
  suggested_response text,
  processing_status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert emails"
  ON emails FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read emails"
  ON emails FOR SELECT
  TO anon
  USING (true);