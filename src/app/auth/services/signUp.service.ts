import { inject, Injectable } from '@angular/core';
import { SnackBarService } from '../../shared/services/snackBar.service';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _supabaseClient: SupabaseClient = inject(SupabaseClient);

  // 🔹 Reutilizamos el método para obtener el usuario con su rol
  private async getUserWithRole(userId: string) {
    const { data, error } = await this._supabaseClient
      .from('profile')
      .select(
        `
          id,
          roleTypeId,
          roleType:roleType!fk_profile_roletype (
            id,
            code,
            name
          )
        `
      )
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo usuario con rol:', error);
      throw error;
    }

    return data;
  }

  // 🔹 Registro normal de usuario
  async signUp(
    email: string,
    password: string,
    pendingUserData: { fullName: string; country: string; phone: string; email: string }
  ) {
    try {
      // 1️⃣ Verificar si ya existe el correo
      const { data: existingProfile, error: fetchError } = await this._supabaseClient
        .from('profile')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Error al verificar el correo. Inténtalo de nuevo.');
      }

      if (existingProfile) {
        throw new Error('Este correo ya está registrado.');
      }

      // 2️⃣ Crear usuario en Auth
      const { data, error } = await this._supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: pendingUserData,
        },
      });

      if (error) {
        console.error('❌ Error en signUp:', error);
        if (error.message.includes('User already registered')) {
          throw new Error('Este correo ya está registrado.');
        }
        throw new Error('No se pudo completar el registro. Inténtalo de nuevo.');
      }

      if (!data.user) {
        throw new Error('No se pudo crear el usuario. Inténtalo de nuevo.');
      }

      console.log('✅ Usuario creado en Auth:', data.user.id);

      // 3️⃣ Crear perfil en la tabla "profile"
      const { error: profileError } = await this._supabaseClient.from('profile').insert({
        id: data.user.id,
        email: data.user.email,
        fullName: pendingUserData.fullName,
        country: pendingUserData.country,
        phone: pendingUserData.phone,
        roleTypeId: 'ee3609d2-da86-4e9e-84a5-fb8814b17031', // 👈 rol por defecto
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('⚠️ Error creando perfil:', profileError);
        throw new Error('Error al crear el perfil. Inténtalo de nuevo.');
      }

      console.log('✅ Perfil creado exitosamente');

      // 4️⃣ Obtener usuario con su rol
      const userWithRole = await this.getUserWithRole(data.user.id);

      // 5️⃣ Guardar en localStorage
      localStorage.setItem('userData', JSON.stringify(userWithRole));

      // 6️⃣ Mostrar mensaje
      this._snackBarService.success(
        'Te has registrado correctamente. Revisa tu correo para activar tu cuenta.'
      );

      return { ...data, userWithRole };
    } catch (err) {
      console.error('❌ Error completo:', err);
      const message = err instanceof Error ? err.message : 'Error desconocido al registrarse.';
      this._snackBarService.error(message);
      throw err;
    }
  }
}
