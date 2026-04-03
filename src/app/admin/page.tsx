import AdminLayout from '@/components/layout/AdminLayout';
import { adminData, events, speakers } from '@/lib/data';
import Link from 'next/link';

const metrics = adminData.dashboardMetrics;
const recentRegs = adminData.recentRegistrations.slice(0, 6);

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<string, { label: string; styles: string }> = {
  confirmed: { label: 'Confirmado', styles: 'border-[#A56E52] text-[#A56E52]' },
  pending:   { label: 'Pendiente',  styles: 'border-[#D7C6B2] text-[#5B4638]' },
  cancelled: { label: 'Cancelado',  styles: 'border-[#2A2421] text-[#2A2421]' },
};

const mockBars = [42, 68, 55, 80, 63, 90, 74, 58, 85, 70, 95, 82];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Eventos */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Total Eventos</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{metrics.upcomingEvents + 5}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {metrics.upcomingEvents} próximos
          </p>
        </div>

        {/* Registros Activos */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Registros</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">
            {metrics.activeRegistrations.toLocaleString()}
          </p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            +{metrics.registrationGrowth}% este trimestre
          </p>
        </div>

        {/* Speakers */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Speakers</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{speakers.length}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {speakers.filter(s => s.featured).length} destacados
          </p>
        </div>

        {/* Ingresos */}
        <div className="border border-[#A56E52] bg-[#A56E52]/5 p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Ingresos</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            +{metrics.revenueGrowth}% vs año anterior
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 border border-[#2A2421] bg-[#2A2421] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#5B4638] hover:border-[#5B4638]"
        >
          + Nuevo Evento
        </Link>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-2 border border-[#2A2421] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#2A2421] transition-colors hover:bg-[#2A2421] hover:text-[#F7F3EE]"
        >
          Ver Leads
        </Link>
        <Link
          href="/admin/media"
          className="inline-flex items-center gap-2 border border-[#D7C6B2] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#5B4638] transition-colors hover:bg-[#EAE1D6]"
        >
          Ver Media
        </Link>
      </div>

      {/* Main content grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Registrations table */}
        <div className="xl:col-span-2 border border-[#EAE1D6] bg-[#FDFAF7]">
          <div className="border-b border-[#EAE1D6] px-7 py-5 flex items-center justify-between">
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#2A2421]">
              Registros Recientes
            </p>
            <Link
              href="/admin/registrations"
              className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EAE1D6]">
                  <th className="px-7 py-4 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Nombre</th>
                  <th className="px-4 py-4 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Evento</th>
                  <th className="px-4 py-4 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Fecha</th>
                  <th className="px-4 py-4 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
                  <th className="px-7 py-4 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.map((reg, i) => {
                  const status = statusConfig[reg.status];
                  return (
                    <tr key={i} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                      <td className="px-7 py-5">
                        <p className="font-sans text-sm text-[#2A2421]">{reg.name}</p>
                        <p className="font-sans text-[10px] text-[#5B4638]">{reg.email}</p>
                      </td>
                      <td className="px-4 py-5 hidden md:table-cell">
                        <p className="font-sans text-xs text-[#2A2421] max-w-[180px] truncate">{reg.event}</p>
                      </td>
                      <td className="px-4 py-5 hidden lg:table-cell">
                        <p className="font-sans text-xs text-[#5B4638]">{formatDate(reg.date)}</p>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${status.styles}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-7 py-5 text-right">
                        <p className="font-sans text-sm text-[#2A2421] font-medium">
                          {reg.amount === 0 ? 'Gratis' : formatCurrency(reg.amount)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#2A2421] mb-1">
            Actividad Reciente
          </p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638] mb-6">
            Registros — últimos 12 meses
          </p>

          {/* Bar chart */}
          <div className="flex items-end gap-1.5 h-32">
            {mockBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#A56E52]/20 hover:bg-[#A56E52]/40 transition-colors relative group"
                style={{ height: `${h}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#A56E52] transition-all duration-300"
                  style={{ height: `${h * 0.6}%` }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">May 2024</p>
            <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">Abr 2025</p>
          </div>

          {/* KPIs */}
          <div className="mt-6 border-t border-[#EAE1D6] pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">Conversión</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{metrics.conversionRate}%</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">Ticket Promedio</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{formatCurrency(metrics.avgTicketValue)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">Leads Abiertos</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{metrics.openLeads}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
