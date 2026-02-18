const https = require('https');
const cheerio = require('cheerio');

// Fallback when DolarHoy and APIs fail
const FALLBACK_USD_BUY = 980;
const FALLBACK_USD_SELL = 1000;

/**
 * Fetch HTML from URL (follows redirects once)
 */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GrupoAlvarez/1.0)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location;
        if (location) return fetchHtml(location.startsWith('http') ? location : new URL(location, url).href).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * Parse Dolar Blue compra/venta from DolarHoy.com HTML
 * Source: https://dolarhoy.com/cotizaciondolarblue (Dólar Libre = Blue)
 */
function parseDolarHoy(html) {
  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ');
  let compra = null;
  let venta = null;

  // Option A: "Dólar Libre" + compra,venta + optional space + venta e.g. "Dólar Libre 1420,00 1440,00"
  const libreSpace = text.match(/Dólar\s*Libre\s*(\d{3,}),(\d{2})\s+(\d{3,}),(\d{2})/i);
  if (libreSpace) {
    compra = parseFloat(`${libreSpace[1]}.${libreSpace[2]}`);
    venta = parseFloat(`${libreSpace[3]}.${libreSpace[4]}`);
  }

  // Option B: "Dólar Libre" + two numbers glued e.g. "Dólar Libre1420,001440,00"
  if ((compra == null || venta == null) && /Dólar\s*Libre/i.test(text)) {
    const libreGlued = text.match(/Dólar\s*Libre\s*(\d{3,}),(\d{2})\s*(\d{3,}),(\d{2})/i);
    if (libreGlued) {
      compra = parseFloat(`${libreGlued[1]}.${libreGlued[2]}`);
      venta = parseFloat(`${libreGlued[3]}.${libreGlued[4]}`);
    }
  }

  // Option C: first "Compra" / "Venta" with $ and number (main Blue box)
  if (compra == null || venta == null) {
    const compraMatch = text.match(/(?:Compra)\s*\$?\s*(\d{3,})[.,]?(\d*)/i);
    const ventaMatch = text.match(/(?:Venta)\s*\$?\s*(\d{3,})[.,]?(\d*)/i);
    if (compraMatch) compra = parseFloat(compraMatch[2] ? `${compraMatch[1]}.${compraMatch[2]}` : compraMatch[1]);
    if (ventaMatch) venta = parseFloat(ventaMatch[2] ? `${ventaMatch[1]}.${ventaMatch[2]}` : ventaMatch[1]);
  }

  const valid = compra != null && venta != null && !Number.isNaN(compra) && !Number.isNaN(venta) && compra > 0 && venta > 0;
  if (valid) return { compra, venta };
  return null;
}

/**
 * Parse Dólar Blue compra/venta from El Cronista HTML
 * Source: https://www.cronista.com/MercadosOnline/moneda/ARSB/
 * Page shows "Valor de compra" / "Valor de venta" e.g. $ 1.420 / $ 1.440 (formato AR: punto miles)
 */
function parseElCronista(html) {
  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ');
  let compra = null;
  let venta = null;

  // "Valor de compra" / "Valor de venta" seguido de $ y número (ej. $ 1.420 o $ 1.440)
  const compraBlock = text.match(/Valor\s+de\s+compra\s*\$?\s*([\d.,]+)/i);
  const ventaBlock = text.match(/Valor\s+de\s+venta\s*\$?\s*([\d.,]+)/i);
  if (compraBlock) compra = normalizeNum(compraBlock[1]);
  if (ventaBlock) venta = normalizeNum(ventaBlock[1]);

  const valid = compra != null && venta != null && !Number.isNaN(compra) && !Number.isNaN(venta) && compra > 0 && venta > 0;
  if (valid) return { compra, venta };
  return null;
}

/** Convierte string numérico AR (1.420 o 1,42) a número */
function normalizeNum(str) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.trim().replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return null;
  return n;
}

/**
 * Fetch Dolar Blue from El Cronista (cotización en vivo)
 * https://www.cronista.com/MercadosOnline/moneda/ARSB/
 */
function fetchElCronista() {
  const url = 'https://www.cronista.com/MercadosOnline/moneda/ARSB/';
  return fetchHtml(url).then((html) => {
    const parsed = parseElCronista(html);
    if (parsed) return Promise.resolve(parsed);
    return Promise.reject(new Error('Could not parse El Cronista HTML'));
  });
}

/**
 * Fetch Dolar Blue: fuente principal El Cronista, luego DolarAPI, luego DolarHoy.
 * Falls back to simulated values if all fail.
 */
function fetchDolarBlue() {
  return fetchElCronista()
    .then((result) => (result ? { ...result, source: 'cronista.com', updated: new Date().toISOString() } : null))
    .catch((err) => {
      console.error('El Cronista fetch error:', err.message);
      return null;
    })
    .then((data) => {
      if (data && data.compra > 0 && data.venta > 0) return data;
      return fetchDolarApi()
        .then((apiData) => {
          if (apiData.compra > 0 && apiData.venta > 0) return apiData;
          return fetchDolarHoy().then((r) => (r ? { ...r, source: 'dolarhoy.com', updated: new Date().toISOString() } : apiData));
        })
        .catch(() => fetchDolarHoy()
          .then((result) => (result ? { ...result, source: 'dolarhoy.com', updated: new Date().toISOString() } : fetchDolarApi()))
          .catch((err2) => {
            console.error('DolarHoy fetch error:', err2.message);
            return fetchDolarApi();
          }));
    });
}

/**
 * Primary source: DolarHoy.com cotización dólar blue
 */
function fetchDolarHoy() {
  const url = 'https://dolarhoy.com/cotizaciondolarblue';
  return fetchHtml(url).then((html) => {
    const parsed = parseDolarHoy(html);
    if (parsed) return Promise.resolve(parsed);
    return Promise.reject(new Error('Could not parse DolarHoy HTML'));
  });
}

/**
 * Fallback: DolarAPI.com (JSON)
 */
function fetchDolarApi() {
  return new Promise((resolve) => {
    const req = https.get('https://dolarapi.com/v1/dolares/blue', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const compra = json.compra != null ? Number(json.compra) : FALLBACK_USD_BUY;
          const venta = json.venta != null ? Number(json.venta) : FALLBACK_USD_SELL;
          resolve({ compra, venta, source: 'dolarapi.com', updated: json.fechaActual || new Date().toISOString() });
        } catch (e) {
          console.error('DolarAPI parse error:', e.message);
          resolve({ compra: FALLBACK_USD_BUY, venta: FALLBACK_USD_SELL, source: 'simulated', updated: new Date().toISOString() });
        }
      });
    });
    req.on('error', () => resolve({ compra: FALLBACK_USD_BUY, venta: FALLBACK_USD_SELL, source: 'simulated', updated: new Date().toISOString() }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ compra: FALLBACK_USD_BUY, venta: FALLBACK_USD_SELL, source: 'simulated', updated: new Date().toISOString() }); });
  });
}

module.exports = {
  fetchDolarBlue,
  fetchDolarHoy,
  fetchDolarApi,
  fetchElCronista,
  parseDolarHoy,
  parseElCronista,
  FALLBACK_USD_BUY,
  FALLBACK_USD_SELL
};
