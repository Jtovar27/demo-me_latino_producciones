# Real Happiness — Hosts Editables — Resumen de Implementación

**Fecha:** 2026-06-19
**Proyecto:** ME Producciones / ME Latino Producciones
**Commit:** `e8fb538` (pusheado a `main`)
**Migración:** `009_real_happiness_hosts.sql` — **ya ejecutada en Supabase** ✅
**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · Supabase · TypeScript

---

## 1. Qué se pidió

En la página `/the-real-happiness`, el bloque **"Hosted by / Conducción"** (Mónica
Espinoza y Joyce Urdaneta) estaba **hardcodeado** en el código. El dueño quería que
esa sección fuera **ajustable**, para poder cambiar por cada host:

- la **imagen**
- el **nombre**
- el **subtítulo** (rol, ej. "Host · El Sol Network TV Orlando")
- la **descripción**

…sin necesidad de redeploy.

## 2. Decisiones tomadas (confirmadas con el dueño)

| # | Decisión | Elección |
|---|----------|----------|
| 1 | Idioma del subtítulo y descripción | **Bilingüe (ES + EN)** — se conserva el comportamiento del sitio (muestra el idioma del visitante) |
| 2 | Modo de gestión | **Lista completa**: agregar / quitar / reordenar / activar-desactivar (igual que "Speakers Confirmados") |

## 3. Cómo se hizo (patrón reutilizado)

Se **replicó el patrón existente** de `real_happiness_speakers` (la sección de
"Speakers Confirmados" que ya era editable), aplicado a los hosts. Nada nuevo que
mantener: misma forma de tabla, mismas acciones, mismo admin, mismo fallback.

## 4. Modelo de datos

Tabla nueva `public.real_happiness_hosts`:

| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | nombre del host |
| `role_es` / `role_en` | text | subtítulo / rol (bilingüe) |
| `bio_es` / `bio_en` | text | descripción (bilingüe) |
| `image_url` | text \| null | foto (subida desde el admin con MediaPicker) |
| `sort_order` | integer | orden de aparición |
| `active` | boolean | visible / oculto |
| `created_at` / `updated_at` | timestamptz | |

- **RLS:** lectura pública solo de filas `active = true`. El admin usa el service
  role key (que omite RLS), así que no hace falta política de escritura.
- **Seed:** la migración inserta los 2 hosts actuales (Mónica con su foto
  `/MEspinoza.jpg.png`; Joyce sin foto, para que se suba desde el admin).
- Idempotente y aditiva (`create table if not exists` + `on conflict do nothing`).

## 5. Archivos

### Nuevos
- `supabase/migrations/009_real_happiness_hosts.sql` — tabla + RLS + seed.
- `docs/REAL_HAPPINESS_HOSTS_IMPLEMENTATION.md` — este resumen.

### Modificados
- `src/types/supabase.ts` — tipo `RealHappinessHostRow`, tabla `real_happiness_hosts`
  en `Database`, y export `DBRealHappinessHost`.
- `src/app/actions/realHappiness.ts` — nuevas acciones:
  - `getRealHappinessHosts()` — público, solo activos, con **fallback estático**
    (FALLBACK_HOSTS) por si la tabla aún no existiera.
  - `getAllRealHappinessHosts()` — admin, incluye inactivos.
  - `upsertRealHappinessHost(formData)` — crear/editar.
  - `deleteRealHappinessHost(id)`.
  - `reorderRealHappinessHosts(orderedIds)`.
- `src/app/admin/real-happiness/page.tsx` — nueva sección **Hosts** (arriba de
  Speakers): tabla con foto/nombre, subtítulo, reordenar (↤ ↑ ↓ ↦), editar,
  eliminar; y un modal con `MediaPicker` (imagen), nombre, subtítulo ES/EN,
  descripción ES/EN, y estado activo/inactivo.
- `src/app/the-real-happiness/page.tsx` — las tarjetas de hosts ahora se construyen
  desde la BD (`getRealHappinessHosts`). Prioridad de imagen por host:
  1. `image_url` de la fila (subida por admin)
  2. coincidencia por nombre en la tabla general `speakers` (compat. anterior)
  3. iniciales (placeholder). Se eliminaron las claves de copy `host1*/host2*` que
     quedaron sin uso.
- `src/lib/i18n/translations.ts` — textos del admin (bilingües) bajo
  `adminRealHappiness`: `hostsTitle`, `hostsDesc`, `addHost`, `noHosts`,
  `editHostModal`, `newHostModal`, `roleEsLbl`, `roleEnLbl`, `bioEsLbl`, `bioEnLbl`,
  `saveHost`, `deleteHostConfirm`, `hostCreated`, `hostUpdated`, `hostDeleted`.

## 6. Verificación (todo verde)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errores |
| `npm run lint` | **PASS** — 0 errores (7 warnings pre-existentes, ninguno en código nuevo) |
| `npm test` (vitest) | **PASS** — 79/79 tests |
| `npm run build` | **PASS** — `/the-real-happiness` y `/admin/real-happiness` compilan |

## 7. Estado de despliegue

- **Código:** commit `e8fb538` en `main`, ya pusheado a GitHub. Árbol de trabajo limpio.
- **Base de datos:** migración `009_real_happiness_hosts.sql` **ya ejecutada en
  Supabase** por el dueño (2026-06-19). La edición de hosts ya persiste.

## 8. Cómo usarlo (para el dueño)

1. Entra a **/admin/real-happiness** → sección **Hosts (Conducción)**.
2. **Editar** un host (ej. Joyce): cambia foto (con el botón de imagen / subir),
   nombre, subtítulo (ES y EN) y descripción (ES y EN). Guardar.
3. **+ Nuevo host** para agregar otro; las flechas reordenan; "Eliminar" lo quita.
4. El estado **Activo/Inactivo** controla si aparece en el sitio público.
5. Los cambios se reflejan en **/the-real-happiness** al recargar.

> Nota: Joyce empezó sin foto a propósito (no había imagen suya en el repo). Sube su
> foto desde el admin y aparecerá de inmediato.

## 9. No-objetivos / notas

- No se tocó la sección de "Speakers Confirmados" ni las sedes (estas viven en
  `flagship_events`, se editan en /admin/flagship).
- El subtítulo y la descripción son contenido bilingüe que escribe el admin (no se
  traducen automáticamente).
- El fallback estático (FALLBACK_HOSTS) solo entra si la tabla no existiera; como la
  migración ya corrió, manda la BD.
