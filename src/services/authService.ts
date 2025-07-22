import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manufacturer' | 'customer';
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    return { user: null, error };
  }

  // For demo purposes, assign roles based on email domain
  let role: 'admin' | 'manufacturer' | 'customer' = 'customer';
  if (email.includes('admin')) role = 'admin';
  else if (email.includes('manufacturer')) role = 'manufacturer';

  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    role
  };

  return { user, error: null };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    return { user: null, error };
  }

  // For demo purposes, assign roles based on email domain
  let role: 'admin' | 'manufacturer' | 'customer' = 'customer';
  if (email.includes('admin')) role = 'admin';
  else if (email.includes('manufacturer')) role = 'manufacturer';

  const user: User = {
    id: data.user!.id,
    email: data.user!.email!,
    role
  };

  return { user, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // For demo purposes, assign roles based on email domain
  let role: 'admin' | 'manufacturer' | 'customer' = 'customer';
  if (user.email?.includes('admin')) role = 'admin';
  else if (user.email?.includes('manufacturer')) role = 'manufacturer';

  return {
    id: user.id,
    email: user.email!,
    role
  };
}