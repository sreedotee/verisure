import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manufacturer' | 'customer';
}

// Demo users for fallback (when Supabase auth isn’t configured)
const DEMO_USERS = [
  { email: 'admin@verisure.com', password: 'password123', role: 'admin' as const },
  { email: 'manufacturer@verisure.com', password: 'password123', role: 'manufacturer' as const },
  { email: 'customer@verisure.com', password: 'password123', role: 'customer' as const },
];

function getDemoUser(email: string, password: string) {
  return DEMO_USERS.find(user => user.email === email && user.password === password);
}

function getRoleFromEmail(email: string): 'admin' | 'manufacturer' | 'customer' {
  if (email.includes('admin')) return 'admin';
  if (email.includes('manufacturer')) return 'manufacturer';
  return 'customer';
}

export async function signIn(email: string, password: string) {
  // 👇 Try demo user fallback first (for faster local testing)
  const demoUser = getDemoUser(email, password);
  if (demoUser) {
    const user: User = {
      id: `demo-${demoUser.role}`,
      email: demoUser.email,
      role: demoUser.role
    };
    localStorage.setItem('demo-user', JSON.stringify(user));
    return { user, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return { user: null, error: error || { message: 'Invalid credentials' } };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      role: getRoleFromEmail(data.user.email!)
    };
    return { user, error: null };

  } catch (error) {
    return { user: null, error: error as any };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      // Fallback for demo
      const role = getRoleFromEmail(email);
      const user: User = {
        id: `demo-${Date.now()}`,
        email,
        role
      };
      localStorage.setItem('demo-user', JSON.stringify(user));
      return { user, error: null };
    }

    const user: User = {
      id: data.user!.id,
      email: data.user!.email!,
      role: getRoleFromEmail(data.user!.email!)
    };
    return { user, error: null };

  } catch (error) {
    const role = getRoleFromEmail(email);
    const user: User = {
      id: `demo-${Date.now()}`,
      email,
      role
    };
    localStorage.setItem('demo-user', JSON.stringify(user));
    return { user, error: null };
  }
}

export async function signOut() {
  localStorage.removeItem('demo-user');
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch {
    return { error: null };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const demoUser = localStorage.getItem('demo-user');
  if (demoUser) return JSON.parse(demoUser);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      role: getRoleFromEmail(user.email!)
    };

  } catch {
    return null;
  }
}
