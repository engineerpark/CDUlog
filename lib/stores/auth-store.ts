// 실외기케어 대시보드 - 인증 상태 관리 (Zustand)
'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/auth-helpers-nextjs'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
  
  // Computed
  isAuthenticated: () => boolean
  hasRole: (role: string | string[]) => boolean
  hasPermission: (requiredRole: string) => boolean
}

const roleHierarchy: Record<string, number> = {
  viewer: 1,
  technician: 2,
  manager: 3,
  admin: 4
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    const supabase = createClient()
    
    try {
      set({ loading: true })
      
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        set({ user: null, profile: null, loading: false, initialized: true })
        return
      }

      if (session?.user) {
        // 프로필 정보 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          set({ 
            user: session.user, 
            profile: null, 
            loading: false, 
            initialized: true 
          })
        } else {
          set({ 
            user: session.user, 
            profile, 
            loading: false, 
            initialized: true 
          })
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true })
      }

      // 인증 상태 변경 리스너 설정
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // 프로필 정보 다시 가져오기
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: session.user, profile, loading: false })
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, loading: false })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          set({ user: session.user })
        }
      })

    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ user: null, profile: null, loading: false, initialized: true })
    }
  },

  signOut: async () => {
    const supabase = createClient()
    set({ loading: true })
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
      set({ user: null, profile: null, loading: false })
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      set({ loading: false })
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user || !profile) return false

    const supabase = createClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        set({ loading: false })
        return false
      }

      set({ profile: data, loading: false })
      return true
    } catch (error) {
      console.error('Unexpected error updating profile:', error)
      set({ loading: false })
      return false
    }
  },

  // Computed values
  isAuthenticated: () => {
    const { user } = get()
    return !!user
  },

  hasRole: (role) => {
    const { profile } = get()
    if (!profile) return false
    
    if (Array.isArray(role)) {
      return role.includes(profile.role)
    }
    
    return profile.role === role
  },

  hasPermission: (requiredRole) => {
    const { profile } = get()
    if (!profile) return false
    
    const userLevel = roleHierarchy[profile.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0
    
    return userLevel >= requiredLevel
  },
}))

// Hook for easy access to computed values
export const useAuth = () => {
  const store = useAuthStore()
  return {
    ...store,
    isAuthenticated: store.isAuthenticated(),
    hasRole: store.hasRole,
    hasPermission: store.hasPermission,
  }
}