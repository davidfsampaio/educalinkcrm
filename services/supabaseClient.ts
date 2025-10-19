import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua os valores abaixo pelos do seu projeto Supabase!
// Você pode encontrá-los no seu painel Supabase em: Project Settings -> API

const supabaseUrl = 'https://tvuxbrnumocwkvrzkahh.supabase.co'; // Substitua por sua Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dXhicm51bW9jd2t2cnprYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDgwMTYsImV4cCI6MjA3NjM4NDAxNn0.9LP-Ch0DwGYaVdDacdoibrJRs3Nvx3kDXBicq3q0CFw'; // Substitua pela sua chave 'anon public'

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('<')) {
    throw new Error('Supabase URL and Anon Key must be updated in services/supabaseClient.ts. Please replace placeholder values with your actual project credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
