/**
 * Admin portal end-to-end test
 * Run: node __tests__/admin-flow.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const P = '\u001b[32m✓\u001b[0m';
const F = '\u001b[31m✗\u001b[0m';
let passed = 0, failed = 0;

function log(icon, msg) { console.log(`  ${icon} ${msg}`); }
async function check(label, fn) {
  try { await fn(); log(P, label); passed++; }
  catch (e) { log(F, `${label}\n      ${e.message.split('\n')[0]}`); failed++; }
}

// Wait for a modal/panel to appear (any fixed/absolute overlay with inputs)
async function waitForModal(page) {
  await page.waitForSelector('input[type="text"], input[type="email"], textarea', { timeout: 6000 });
}

// Find the first visible text input inside a modal overlay
function inputsInModal(page) {
  return page.locator('div[class*="absolute"] input[type="text"], div[class*="fixed"] input[type="text"]');
}

async function login(page) {
  console.log('\n\u001b[1m[1] Login\u001b[0m');
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await check('Login y dashboard', () => page.waitForURL(`${BASE}/admin`, { timeout: 8000 }));
}

async function testSpeaker(page) {
  console.log('\n\u001b[1m[2] Crear Speaker\u001b[0m');
  await page.goto(`${BASE}/admin/speakers`);
  await check('Página speakers carga', () => page.waitForSelector('h2', { timeout: 5000 }));

  // Click "Agregar Speaker" button
  await page.getByRole('button', { name: /agregar speaker/i }).click();

  await check('Modal speaker abre', async () => {
    await page.waitForSelector('text=Guardar', { timeout: 4000 });
  });

  // Fill inputs by order inside the modal (name, title, org, bio, instagram)
  const inputs = page.locator('.fixed input[type="text"], .absolute input[type="text"]');
  await inputs.nth(0).fill('María García');       // name
  await inputs.nth(1).fill('CEO & Founder');       // title
  await inputs.nth(2).fill('Latina Leaders');      // organization

  const textarea = page.locator('.fixed textarea, .absolute textarea').first();
  if (await textarea.count()) await textarea.fill('Líder latina con 15 años de experiencia en desarrollo de comunidades.');

  await page.getByRole('button', { name: /^guardar$/i }).click();

  await check('Speaker guardado (toast aparece)', async () => {
    await page.waitForSelector('text=/guardad|Speaker/i', { timeout: 8000 });
  });

  await check('Speaker aparece en la lista', async () => {
    await page.waitForSelector('text=María García', { timeout: 5000 });
  });
}

async function testSponsor(page) {
  console.log('\n\u001b[1m[3] Crear Sponsor\u001b[0m');
  await page.goto(`${BASE}/admin/sponsors`);
  await check('Página sponsors carga', () => page.waitForSelector('h2', { timeout: 5000 }));

  await page.getByRole('button', { name: /agregar|nuevo sponsor|\+ /i }).first().click();

  await check('Modal sponsor abre', async () => {
    await page.waitForSelector('text=Guardar', { timeout: 4000 });
  });

  const inputs = page.locator('.fixed input[type="text"], .absolute input[type="text"]');
  await inputs.nth(0).fill('Vive Foods');   // name

  const websiteInput = page.locator('.fixed input[type="url"], .absolute input[type="url"], .fixed input[placeholder*="http"], .absolute input[placeholder*="http"]').first();
  if (await websiteInput.count()) await websiteInput.fill('https://vivefoods.com');

  const select = page.locator('.fixed select, .absolute select').first();
  if (await select.count()) await select.selectOption('gold');

  const textarea = page.locator('.fixed textarea, .absolute textarea').first();
  if (await textarea.count()) await textarea.fill('Marca líder en alimentación saludable para la comunidad latina.');

  await page.getByRole('button', { name: /^guardar$/i }).click();

  await check('Sponsor guardado (toast aparece)', async () => {
    await page.waitForSelector('text=/guardad|Sponsor/i', { timeout: 8000 });
  });

  await check('Sponsor aparece en la lista', async () => {
    await page.waitForSelector('text=Vive Foods', { timeout: 5000 });
  });
}

async function testEvent(page) {
  console.log('\n\u001b[1m[4] Crear Evento\u001b[0m');
  await page.goto(`${BASE}/admin/events`);
  await check('Página eventos carga', () => page.waitForSelector('h2', { timeout: 5000 }));

  await page.getByRole('button', { name: /nuevo evento|\+ /i }).first().click();

  await check('Panel/modal evento abre', async () => {
    await page.waitForSelector('text=Guardar', { timeout: 4000 });
  });

  const inputs = page.locator('.fixed input[type="text"], .absolute input[type="text"]');
  const count = await inputs.count();

  // Fill as many text fields as exist: title, slug, city, state, venue...
  if (count > 0) await inputs.nth(0).fill('The Real Happiness Miami 2026');
  if (count > 1) await inputs.nth(1).fill('the-real-happiness-miami-2026');
  if (count > 2) await inputs.nth(2).fill('Miami');
  if (count > 3) await inputs.nth(3).fill('FL');
  if (count > 4) await inputs.nth(4).fill('The Fillmore Miami Beach');

  const dateInput = page.locator('.fixed input[type="date"], .absolute input[type="date"]').first();
  if (await dateInput.count()) await dateInput.fill('2026-10-15');

  const numInputs = page.locator('.fixed input[type="number"], .absolute input[type="number"]');
  if (await numInputs.count() > 0) await numInputs.nth(0).fill('397');
  if (await numInputs.count() > 1) await numInputs.nth(1).fill('1200');

  const textarea = page.locator('.fixed textarea, .absolute textarea').first();
  if (await textarea.count()) await textarea.fill('Dos días transformadores diseñados para reconectarte con tu propósito y comunidad latina.');

  await page.getByRole('button', { name: /^guardar$/i }).click();

  await check('Evento guardado (toast aparece)', async () => {
    await page.waitForSelector('text=/guardad|Evento/i', { timeout: 8000 });
  });

  await check('Evento aparece en la lista', async () => {
    await page.waitForSelector('text=Miami 2026', { timeout: 5000 });
  });
}

async function testExperience(page) {
  console.log('\n\u001b[1m[5] Crear Experiencia\u001b[0m');
  await page.goto(`${BASE}/admin/experiences`);
  await check('Página experiencias carga', () => page.waitForSelector('h2', { timeout: 5000 }));

  await page.getByRole('button', { name: /nueva experiencia|\+ /i }).first().click();

  await check('Panel/modal experiencia abre', async () => {
    await page.waitForSelector('text=Guardar', { timeout: 4000 });
  });

  const inputs = page.locator('.fixed input[type="text"], .absolute input[type="text"]');
  const count = await inputs.count();
  if (count > 0) await inputs.nth(0).fill('Bienestar Wellness Retreat');
  if (count > 1) await inputs.nth(1).fill('bienestar-wellness-retreat');

  const textareas = page.locator('.fixed textarea, .absolute textarea');
  if (await textareas.count() > 0) await textareas.nth(0).fill('Retiro integral de bienestar para líderes latinos.');
  if (await textareas.count() > 1) await textareas.nth(1).fill('Experiencia de restauración profunda con meditación, breathwork y conexión comunitaria.');

  await page.getByRole('button', { name: /^guardar$/i }).click();

  await check('Experiencia guardada (toast aparece)', async () => {
    await page.waitForSelector('text=/guardad|Experiencia/i', { timeout: 8000 });
  });

  await check('Experiencia aparece en lista', async () => {
    await page.waitForSelector('text=Bienestar', { timeout: 5000 });
  });
}

async function testSettings(page) {
  console.log('\n\u001b[1m[6] Settings\u001b[0m');
  await page.goto(`${BASE}/admin/settings`);
  await check('Página settings carga', () => page.waitForSelector('input', { timeout: 5000 }));

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill('hola@melatinopr.com');

  await page.getByRole('button', { name: /guardar cambios/i }).click();

  await check('Settings guardados', async () => {
    await page.waitForSelector('text=/guardado|Cambios/i', { timeout: 8000 });
  });
}

async function testPublicPages(page) {
  console.log('\n\u001b[1m[7] Páginas públicas\u001b[0m');
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/events', name: 'Eventos' },
    { url: '/experiences', name: 'Experiencias' },
    { url: '/sponsors', name: 'Sponsors' },
    { url: '/gallery', name: 'Galería' },
    { url: '/contact', name: 'Contacto' },
  ];
  for (const { url, name } of pages) {
    await check(`${name} (${url}) sin errores`, async () => {
      await page.goto(`${BASE}${url}`);
      await page.waitForSelector('body', { timeout: 8000 });
      const err = await page.locator('text=Application error').count();
      if (err > 0) throw new Error('Application error');
      const errBoundary = await page.locator('text=Something went wrong').count();
      if (errBoundary > 0) throw new Error('Error boundary activado');
    });
  }
}

(async () => {
  console.log('\u001b[1m═══════════════════════════════════════\u001b[0m');
  console.log('\u001b[1m  Admin Portal — Test End-to-End\u001b[0m');
  console.log('\u001b[1m═══════════════════════════════════════\u001b[0m');

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  try {
    await login(page);
    await testSpeaker(page);
    await testSponsor(page);
    await testEvent(page);
    await testExperience(page);
    await testSettings(page);
    await testPublicPages(page);
  } finally {
    await browser.close();
    console.log('\n\u001b[1m═══════════════════════════════════════\u001b[0m');
    const status = failed === 0 ? '\u001b[32mTODO OK\u001b[0m' : `\u001b[31m${failed} fallaron\u001b[0m`;
    console.log(`  Resultado: \u001b[32m${passed} pasaron\u001b[0m  |  ${status}`);
    console.log('\u001b[1m═══════════════════════════════════════\u001b[0m\n');
    process.exit(failed > 0 ? 1 : 0);
  }
})();
