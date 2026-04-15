import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg border border-[#e2e8f0]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366f1]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1e293b]">Crear cuenta</h1>
            <p className="mt-1 text-[#64748b]">Regístrate para comenzar</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-[#64748b]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-[#6366f1] hover:text-[#4f46e5]">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
