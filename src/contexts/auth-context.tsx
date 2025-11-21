import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  savedRecipes: string[];
  saveRecipe: (recipeId: string) => void;
  unsaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load saved recipes when user changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`savedRecipes_${user.id}`);
      if (saved) {
        setSavedRecipes(JSON.parse(saved));
      }
    } else {
      setSavedRecipes([]);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication - check localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      return false; // User already exists
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const saveRecipe = (recipeId: string) => {
    if (!user) return;

    const updated = [...savedRecipes, recipeId];
    setSavedRecipes(updated);
    localStorage.setItem(`savedRecipes_${user.id}`, JSON.stringify(updated));
  };

  const unsaveRecipe = (recipeId: string) => {
    if (!user) return;

    const updated = savedRecipes.filter(id => id !== recipeId);
    setSavedRecipes(updated);
    localStorage.setItem(`savedRecipes_${user.id}`, JSON.stringify(updated));
  };

  const isRecipeSaved = (recipeId: string): boolean => {
    return savedRecipes.includes(recipeId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        savedRecipes,
        saveRecipe,
        unsaveRecipe,
        isRecipeSaved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
