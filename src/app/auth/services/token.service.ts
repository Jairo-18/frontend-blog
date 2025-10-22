import { Injectable } from '@angular/core';
import { supabase } from '../../supabaseClient';
import { UnifiedSession } from '../interfaces/session.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly SESSION_KEY = 'app_session';

  saveSession(accessToken: string, refreshToken: string, userData: UnifiedSession['user']): void {
    if (!accessToken || !refreshToken || !userData) {
      console.warn('⚠️ No se puede guardar sesión: faltan datos');
      return;
    }

    const session: UnifiedSession = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData,
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  getSession(): UnifiedSession | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr) as UnifiedSession;

      if (!session.access_token || !session.refresh_token || !session.user) {
        console.warn('⚠️ Sesión inválida en localStorage, se eliminará');
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Error parseando sesión almacenada:', error);
      this.clearSession();
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.getSession()?.access_token ?? null;
  }

  getRefreshToken(): string | null {
    return this.getSession()?.refresh_token ?? null;
  }

  getUserData(): UnifiedSession['user'] | null {
    return this.getSession()?.user ?? null;
  }

  /** ✅ NUEVO: obtener solo el id del usuario */
  getUserId(): string | null {
    return this.getUserData()?.id ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  async refreshSession(): Promise<UnifiedSession | null> {
    const currentSession = this.getSession();
    if (!currentSession?.refresh_token) {
      console.warn('⚠️ No hay refresh token disponible para refrescar sesión');
      return null;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: currentSession.refresh_token,
    });

    if (error) {
      console.error('❌ Error al refrescar sesión:', error.message);
      this.clearSession();
      return null;
    }

    const newSession = data?.session;
    if (!newSession) {
      console.error('❌ No se recibió una nueva sesión de Supabase');
      return null;
    }

    this.saveSession(newSession.access_token, newSession.refresh_token, currentSession.user);
    return this.getSession();
  }

  updateUserData(userData: UnifiedSession['user']): void {
    const currentSession = this.getSession();
    if (!currentSession) {
      console.warn('⚠️ No hay sesión activa para actualizar datos de usuario');
      return;
    }

    this.saveSession(currentSession.access_token, currentSession.refresh_token, userData);
  }
}
