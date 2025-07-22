import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manufacturer' | 'customer';
}

// Demo users for fallback when Supabase auth is not properly configured
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Check if it's a demo user for fallback
      const demoUser = getDemoUser(email, password);
      if (demoUser) {
        const user: User = {
          id: `demo-${demoUser.role}`,
          email: demoUser.email,
          role: demoUser.role
        };
        
        // Store demo user in localStorage for persistence
        localStorage.setItem('demo-user', JSON.stringify(user));
        return { user, error: null };
      }
      
      return { user: null, error };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      role: getRoleFromEmail(data.user.email!)
    };

    return { user, error: null };
  } catch (error) {
    // Fallback to demo users if Supabase is not configured
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
    
    return { user: null, error: error as any };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      // For demo purposes, allow signup with demo credentials
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
}

export async function signOut() {
  // Clear demo user from localStorage
  localStorage.removeItem('demo-user');
  
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    // Even if Supabase fails, we've cleared the demo user
    return { error: null };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // Check for demo user first
  const demoUser = localStorage.getItem('demo-user');
  if (demoUser) {
    return JSON.parse(demoUser);
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      role: getRoleFromEmail(user.email!)
    };
  } catch (error) {
    return null;
  }
}