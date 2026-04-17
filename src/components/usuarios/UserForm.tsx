'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { UsuarioForm } from '@/types/usuario';
import { Role, ROLES } from '@/types/auth';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
} from 'firebase/auth';

interface UserFormProps {
  initialData?: UsuarioForm & { id: string };
  mode: 'create' | 'edit';
}

const roles: Role[] = ['admin', 'gerente', 'vendedor'];

export function UserForm({ initialData, mode }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UsuarioForm>(
    initialData || {
      email: '',
      nombre: '',
      role: 'vendedor',
      password: '',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();

      if (mode === 'create') {
        // Crear nuevo usuario con Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Guardar perfil en Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          email: formData.email,
          nombre: formData.nombre,
          role: formData.role,
          activo: true,
          createdAt: serverTimestamp(),
        });

        toast.success('Usuario creado exitosamente');
      } else {
        // Actualizar solo el perfil en Firestore
        if (!initialData?.id) {
          toast.error('ID de usuario no encontrado');
          return;
        }

        await updateDoc(doc(db, 'users', initialData.id), {
          nombre: formData.nombre,
          role: formData.role,
        });

        toast.success('Usuario actualizado exitosamente');
      }

      router.push('/usuarios');
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/email-already-in-use') {
        toast.error('El email ya está en uso');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña debe tener al menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else {
        toast.error(mode === 'create' ? 'Error al crear usuario' : 'Error al actualizar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {mode === 'create' ? 'Información del usuario' : 'Editar usuario'}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={mode === 'edit'}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="juan@ejemplo.com"
            />
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-gray-500">El email no se puede cambiar</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rol *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {ROLES[role]}
                </option>
              ))}
            </select>
          </div>

          {mode === 'create' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Actualizar usuario'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
