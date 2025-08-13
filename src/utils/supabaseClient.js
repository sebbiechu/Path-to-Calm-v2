// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ✅ Replace with your own values from Supabase Project Settings → API
const SUPABASE_URL = 'https://paklowtobsxhbgqbbdyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBha2xvd3RvYnN4aGJncWJiZHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDIzMzEsImV4cCI6MjA3MDU3ODMzMX0.-SQ6f_B1hTILixZ5MGjpR9_m4ZCbxdo9bC_TuQTFC2g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
