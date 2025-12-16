import { createClient } from '@supabase/supabase-js';

// LANGSUNG TEMPEL URL & KEY ANDA DISINI (Ganti teks di dalam kutip)
const supabaseUrl = 'https://ierzsrwgnwmhsgqlbhhk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcnpzcndnbndtaHNncWxiaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDE3NjYsImV4cCI6MjA4MTExNzc2Nn0.njJE13fcuVx-w6tmXVy82KMUsO83MR0kYg7dujcCMF8';

export const supabase = createClient(supabaseUrl, supabaseKey);