import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvuxbrnumocwkvrzkahh.supabase.co';
// A chave que você forneceu:
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dXhicm51bW9jd2t2cnprYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDgwMTYsImV4cCI6MjA3NjM4NDAxNn0.9LP-Ch0DwGYaVdDacdoibrJRs3Nvx3kDXBicq3q0CFw';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
