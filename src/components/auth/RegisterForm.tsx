'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { User, Mail, Lock } from 'lucide-react';

export function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, nombre);
      toast.success('Registro exitoso! Redirigiendo...');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Juan Pérez"
        leftIcon={<User className="h-5 w-5" />}
        required
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        leftIcon={<Mail className="h-5 w-5" />}
        required
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        leftIcon={<Lock className="h-5 w-5" />}
        helperText="Mínimo 6 caracteres"
        required
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        leftIcon={<Lock className="h-5 w-5" />}
        required
      />

      <Button
        type="submit"
        isLoading={loading}
        className="w-full mt-6"
      >
        Crear cuenta
      </Button>
    </form>
  );
}
