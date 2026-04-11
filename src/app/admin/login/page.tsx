'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

const initialState = { error: '' };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await loginAction(formData);
      return result ?? { error: '' };
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-[#2A2421] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.4em] text-[#A56E52]">
            ME Producciones
          </p>
          <div className="h-px w-8 bg-[#A56E52] mx-auto mt-3" />
          <p className="mt-4 font-serif text-2xl font-normal text-[#EAE1D6]">
            Portal Admin
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              className="w-full border border-[#5B4638] bg-[#3D342F] px-4 py-3 font-sans text-sm text-[#EAE1D6] placeholder-[#5B4638] outline-none focus:border-[#A56E52] transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-[#5B4638] bg-[#3D342F] px-4 py-3 font-sans text-sm text-[#EAE1D6] placeholder-[#5B4638] outline-none focus:border-[#A56E52] transition-colors"
            />
          </div>

          {state.error && (
            <p className="font-sans text-xs text-red-400 text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full border border-[#A56E52] bg-[#A56E52] py-3.5 font-sans text-[11px] uppercase tracking-widest text-[#FDFAF7] transition-colors hover:bg-[#5B4638] hover:border-[#5B4638] disabled:opacity-50"
          >
            {pending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-[10px] uppercase tracking-widest text-[#3D342F]">
          Acceso restringido
        </p>
      </div>
    </div>
  );
}
