
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "client" | "partner";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  description?: string;
  businessType?: string;
  hours?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: AppUser) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to convert Supabase user to app user format
  const mapUser = (session: Session | null): AppUser | null => {
    if (!session || !session.user) return null;
    
    const { user: supabaseUser } = session;
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata?.role || 'client',
      phone: supabaseUser.user_metadata?.phone || '',
      address: supabaseUser.user_metadata?.address || '',
      city: supabaseUser.user_metadata?.city || '',
      state: supabaseUser.user_metadata?.state || '',
      zip: supabaseUser.user_metadata?.zip || '',
      website: supabaseUser.user_metadata?.website || '',
      description: supabaseUser.user_metadata?.description || '',
      businessType: supabaseUser.user_metadata?.businessType || '',
      hours: supabaseUser.user_metadata?.hours || '',
    };
  };

  // Load user profile from profiles table
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();  // Changed from single() to maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        return;
      }

      // If we have data from the profile, update the user state
      if (data) {
        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            phone: data.phone || prevUser.phone,
            // Add other profile fields here
          };
        });
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        // Only update state with synchronous operations
        setSession(newSession);
        const mappedUser = mapUser(newSession);
        setUser(mappedUser);
        
        // Then, if we have a session, load additional user data asynchronously
        if (newSession?.user) {
          // Using setTimeout to avoid deadlocks in auth state changes
          setTimeout(() => {
            loadUserProfile(newSession.user.id);
          }, 0);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.id);
        
        setSession(currentSession);
        const mappedUser = mapUser(currentSession);
        setUser(mappedUser);
        
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("Login successful:", data?.user?.id);
      
      // Update user role if needed
      if (data.user && role) {
        await supabase.auth.updateUser({
          data: { role }
        });
      }

      // No need to set user/session here, the onAuthStateChange listener will handle it
      
    } catch (error: any) {
      console.error("Login failed", error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });

    } catch (error: any) {
      console.error("Registration failed", error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset request failed", error);
      toast({
        title: "Password reset failed",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting to reset password");
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }
      
      console.log("Password reset successful:", data);

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    } catch (error: any) {
      console.error("Password update failed", error);
      toast({
        title: "Password update failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUser: AppUser) => {
    setIsLoading(true);
    try {
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          state: updatedUser.state,
          zip: updatedUser.zip,
          website: updatedUser.website,
          description: updatedUser.description,
          businessType: updatedUser.businessType,
          hours: updatedUser.hours,
        }
      });

      if (error) throw error;

      // Update profile data in our database
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: updatedUser.name.split(' ')[0],
            last_name: updatedUser.name.split(' ').slice(1).join(' '),
            phone: updatedUser.phone,
            // Add other profile fields here
          });

        if (profileError) throw profileError;
      }

      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    } catch (error: any) {
      console.error("Update failed", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      console.error("Logout failed", error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
