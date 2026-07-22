import { User, Organization } from '@/lib/types';
import { AppStore } from '@/services/store';

const AUTH_TOKEN_KEY = 'lseo_auth_token';

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
}

export class AuthService {
  static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  static setAuthToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    // Also set document cookie for middleware
    document.cookie = `auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }

  static clearAuthToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
  }

  static getCurrentAuth(): AuthState {
    const token = this.getAuthToken();
    const orgs = AppStore.getOrganizations();
    const activeOrgId = AppStore.getActiveOrgId();
    const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0] || null;

    if (!token) {
      return { user: null, organization: null, isAuthenticated: false };
    }

    const user = activeOrg?.users?.[0] || null;
    return {
      user,
      organization: activeOrg,
      isAuthenticated: !!token && !!user,
    };
  }

  static login(email: string, pass: string): { success: boolean; message: string; user?: User } {
    const orgs = AppStore.getOrganizations();
    
    // Find matching registered user across organizations
    for (const org of orgs) {
      const foundUser = org.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        AppStore.setActiveOrgId(org.id);
        this.setAuthToken(`token_${foundUser.id}_${Date.now()}`);
        return {
          success: true,
          message: 'Login successful!',
          user: foundUser,
        };
      }
    }

    // Return strict error requiring registration first
    return { 
      success: false, 
      message: 'No account found with this email. Please click "Create an Account" below to register first.' 
    };
  }

  static register(name: string, email: string, pass: string, orgName: string): { success: boolean; message: string; user?: User } {
    const newOrgId = `org-${Date.now()}`;
    const newUserId = `user-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name,
      email,
      role: 'OWNER',
      organizationId: newOrgId,
    };

    const newOrg: Organization = {
      id: newOrgId,
      name: orgName || `${name}'s Agency`,
      slug: (orgName || name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
      type: 'AGENCY',
      plan: 'TRIAL', // Sets 14-day trial mode
      users: [newUser],
      trialStartedAt: new Date().toISOString(),
    };

    AppStore.saveOrganization(newOrg);
    AppStore.setActiveOrgId(newOrg.id);
    this.setAuthToken(`token_${newUserId}`);

    return {
      success: true,
      message: 'Account & Organization created successfully!',
      user: newUser,
    };
  }

  static resetPassword(email: string, pass: string): { success: boolean; message: string } {
    const orgs = AppStore.getOrganizations();
    let userFound = false;

    for (const org of orgs) {
      const foundUser = org.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (foundUser) {
        userFound = true;
        // Since we are mock-persisting, we just save organization state
        AppStore.saveOrganization(org);
        break;
      }
    }

    if (userFound) {
      return { success: true, message: 'Password has been reset successfully. Please log in with your new password.' };
    }

    return { success: false, message: 'No registered user found with that email address.' };
  }

  static logout() {
    this.clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}
