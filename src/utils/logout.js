import { supabase } from '@/utils/supabaseClient';

export const handleLogout = async (router) => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    router.push('/login');
  } else {
    console.error('Error during logout:', error.message);
  }
};
