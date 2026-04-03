'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useState } from 'react';

const TABS = ['Perfil', 'Notificaciones', 'Integraciones', 'Acceso'] as const;
type Tab = typeof TABS[number];

const notifications = [
  { id: 'new_reg', label: 'Nuevos registros' },
  { id: 'new_lead', label: 'Nuevos leads' },
  { id: 'event_updates', label: 'Actualizaciones de eventos' },
  { id: 'weekly_summary', label: 'Resumen semanal' },
  { id: 'capacity_alerts', label: 'Alertas de capacidad' },
  { id: 'sponsor_comms', label: 'Comunicaciones de sponsors' },
];

const integrations = [
  { name: 'Mailchimp', description: 'Sincronización de listas y automatizaciones de correo.', connected: true },
  { name: 'Stripe', description: 'Procesamiento de pagos y gestión de tickets.', connected: true },
  { name: 'Google Analytics', description: 'Análisis de tráfico y conversiones del sitio web.', connected: false },
];

const teamUsers = [
  { name: 'Mariana Ríos Delgado', email: 'mariana@melatinopr.com', role: 'Admin' },
  { name: 'Santiago Pérez', email: 'santiago@melatinopr.com', role: 'Editor' },
  { name: 'Valeria Mondragón', email: 'valeria@melatinopr.com', role: 'Viewer' },
];

function inputClass() {
  return 'w-full border border-[#D7C6B2] bg-transparent px-4 py-3 text-sm text-[#2A2421] placeholder-[#5B4638]/50 focus:border-[#2A2421] focus:outline-none transition-colors duration-200';
}

function labelClass() {
  return 'block text-[10px] tracking-widest uppercase text-[#5B4638] mb-1.5';
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Perfil');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    new_reg: true,
    new_lead: true,
    event_updates: true,
    weekly_summary: false,
    capacity_alerts: true,
    sponsor_comms: false,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const toggleNotif = (id: string) => {
    setNotifState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-[#2A2421]">Configuración</h2>
          <p className="mt-1 text-sm text-[#5B4638]">Administra las preferencias generales de la plataforma.</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex border-b border-[#EAE1D6]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-6 py-3 text-[10px] tracking-widest uppercase font-medium transition-all duration-200 border-b-2',
                activeTab === tab
                  ? 'border-[#A56E52] text-[#A56E52]'
                  : 'border-transparent text-[#5B4638] hover:text-[#2A2421]',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Perfil */}
        {activeTab === 'Perfil' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass()}>Nombre de empresa</label>
                <input defaultValue="ME Latino Producciones" className={inputClass()} />
              </div>
              <div>
                <label className={labelClass()}>Sitio web</label>
                <input defaultValue="www.melatinopr.com" className={inputClass()} />
              </div>
              <div>
                <label className={labelClass()}>Email de contacto</label>
                <input defaultValue="hola@melatinopr.com" className={inputClass()} />
              </div>
              <div>
                <label className={labelClass()}>Teléfono</label>
                <input defaultValue="+1 (305) 800-0001" className={inputClass()} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Dirección</label>
                <input defaultValue="1234 Brickell Ave, Miami, FL 33131" className={inputClass()} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Descripción breve</label>
                <textarea
                  defaultValue="ME Latino Producciones es una compañía de producción de eventos premium que crea experiencias con propósito, comunidad y transformación para la comunidad latina en Estados Unidos."
                  rows={3}
                  className={inputClass()}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-[#2A2421] bg-[#2A2421] px-8 py-3 text-[10px] tracking-widest uppercase text-[#F7F3EE] transition-all hover:bg-[#5B4638] disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {saved && (
                <span className="text-xs tracking-wide text-[#A56E52]">Cambios guardados correctamente.</span>
              )}
            </div>
          </div>
        )}

        {/* Notificaciones */}
        {activeTab === 'Notificaciones' && (
          <div className="space-y-2">
            <p className="mb-6 text-sm text-[#5B4638]">
              Configura qué notificaciones deseas recibir por correo electrónico.
            </p>
            {notifications.map(({ id, label }) => (
              <div
                key={id}
                className="flex items-center justify-between border border-[#EAE1D6] px-6 py-4"
              >
                <span className="text-sm text-[#2A2421]">{label}</span>
                <button
                  role="switch"
                  aria-checked={notifState[id]}
                  onClick={() => toggleNotif(id)}
                  className={[
                    'relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none',
                    notifState[id] ? 'bg-[#A56E52]' : 'bg-[#D7C6B2]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                      notifState[id] ? 'translate-x-4' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Integraciones */}
        {activeTab === 'Integraciones' && (
          <div className="space-y-4">
            <p className="mb-6 text-sm text-[#5B4638]">
              Gestiona las integraciones externas conectadas a tu cuenta.
            </p>
            {integrations.map(({ name, description, connected }) => (
              <div
                key={name}
                className="flex flex-col gap-3 border border-[#EAE1D6] p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-base text-[#2A2421]">{name}</h3>
                    <span
                      className={[
                        'border px-2 py-0.5 text-[9px] tracking-widest uppercase',
                        connected
                          ? 'border-[#A56E52] text-[#A56E52]'
                          : 'border-[#D7C6B2] text-[#5B4638]',
                      ].join(' ')}
                    >
                      {connected ? 'Conectado' : 'No conectado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5B4638]">{description}</p>
                </div>
                <button
                  className={[
                    'shrink-0 border px-5 py-2 text-[10px] tracking-widest uppercase transition-all',
                    connected
                      ? 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]'
                      : 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE] hover:bg-[#5B4638]',
                  ].join(' ')}
                >
                  {connected ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Acceso */}
        {activeTab === 'Acceso' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-[#5B4638]">
                Gestiona los usuarios con acceso al panel de administración.
              </p>
              <button className="border border-[#2A2421] px-5 py-2 text-[10px] tracking-widest uppercase text-[#2A2421] transition-all hover:bg-[#2A2421] hover:text-[#F7F3EE]">
                Agregar usuario
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EAE1D6]">
                  <th className="pb-3 text-left text-[10px] tracking-widest uppercase text-[#5B4638]">Nombre</th>
                  <th className="pb-3 text-left text-[10px] tracking-widest uppercase text-[#5B4638]">Email</th>
                  <th className="pb-3 text-left text-[10px] tracking-widest uppercase text-[#5B4638]">Rol</th>
                  <th className="pb-3 text-right text-[10px] tracking-widest uppercase text-[#5B4638]">Acción</th>
                </tr>
              </thead>
              <tbody>
                {teamUsers.map((user) => (
                  <tr key={user.email} className="border-b border-[#EAE1D6] transition-colors hover:bg-[#EAE1D6]/20">
                    <td className="py-4 text-sm font-medium text-[#2A2421]">{user.name}</td>
                    <td className="py-4 text-sm text-[#5B4638]">{user.email}</td>
                    <td className="py-4">
                      <span
                        className={[
                          'border px-2 py-0.5 text-[9px] tracking-widest uppercase',
                          user.role === 'Admin'
                            ? 'border-[#2A2421] text-[#2A2421]'
                            : user.role === 'Editor'
                            ? 'border-[#A56E52] text-[#A56E52]'
                            : 'border-[#D7C6B2] text-[#5B4638]',
                        ].join(' ')}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-[10px] tracking-widest uppercase text-[#5B4638] transition-colors hover:text-[#2A2421]">
                        Editar acceso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
