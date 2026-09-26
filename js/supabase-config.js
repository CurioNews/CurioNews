// COLOQUE AQUI os dados públicos do seu projeto Supabase.
// Supabase Dashboard -> Project Settings -> API.
const SUPABASE_URL = 'https://qynqnclnflxxlbkusgiy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_3-E73RDrhoJw2KOTIcOgaA_eTpAoAw5';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
