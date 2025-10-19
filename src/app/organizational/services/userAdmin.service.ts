import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { supabase } from '../../supabaseClient';

@Injectable({
  providedIn: 'root',
})
export class UserAdminService {
  private readonly supabase: SupabaseClient = supabase;
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  constructor() {}

  /**
   * Obtiene usuarios con búsqueda y paginación
   * @param page número de página (empieza en 1)
   * @param limit cantidad de usuarios por página
   * @param search texto a buscar (nombre o correo)
   */
  async getUsers(page: number = 1, limit: number = 10, search: string = '') {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.supabase
        .from('profile')
        .select('id, fullName, email, country, phone, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search.trim() !== '') {
        query = query.or(`fullName.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return { data, count };
    } catch (error: any) {
      console.error('❌ Error al obtener usuarios:', error.message);
      this._snackBarService.error('No se pudieron cargar los usuarios.');
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const { data, error } = await this.supabase.from('profile').select('*').eq('id', id).single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('❌ Error al obtener usuario:', error.message);
      this._snackBarService.error('No se pudo obtener el usuario.');
      throw error;
    }
  }

  async updateUser(
    id: string,
    updates: Partial<{ fullName: string; country: string; phone: string; username: string }>
  ) {
    try {
      const { error } = await this.supabase.from('profile').update(updates).eq('id', id);
      if (error) throw error;

      this._snackBarService.success('Usuario actualizado correctamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar usuario:', error.message);
      this._snackBarService.error('Error al actualizar usuario.');
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const { error } = await this.supabase.from('profile').delete().eq('id', id);
      if (error) throw error;

      this._snackBarService.success('Usuario eliminado correctamente');
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error.message);
      this._snackBarService.error('Error al eliminar usuario.');
      throw error;
    }
  }
}
