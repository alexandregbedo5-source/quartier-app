import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grfxhaoifxxexswxjzby.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZnhoYW9pZnh4ZXhzd3hqemJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDU5MzIsImV4cCI6MjA4ODQ4MTkzMn0.oasOrlAIHdyTasm0D2fm-YwFwLOiiQGPa_LPo1addYU'

export const supabase = createClient(supabaseUrl, supabaseKey)