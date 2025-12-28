import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua os valores abaixo pelos do seu projeto Supabase!
// Você pode encontrá-los no seu painel Supabase em: Project Settings -> API

// FIX: Casted constants to string to avoid unintentional comparison error in TypeScript when comparing with other literals.
const supabaseUrl = 'https://tvuxbrnumocwkvrzkahh.supabase.co' as string;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dXhicm51bW9jd2t2cnprYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDgwMTYsImV4cCI6MjA3NjM4NDAxNn0.9LP-Ch0DwGYaVdDacdoibrJRs3Nvx3kDXBicq3q0CFw' as string;

// FIX: Removed redundant 'supabaseUrl === ''' check as '!supabaseUrl' covers it and TS warns about unintentional comparison for constants.
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('<')) {
    const errorMsg = 'Supabase URL and Anon Key must be updated in services/supabaseClient.ts. Please replace placeholder values with your actual project credentials from your Supabase dashboard.';
    console.error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
