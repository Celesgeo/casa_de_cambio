const { ourRates } = require('./ratesController');

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0,00';
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// @route GET /api/quote/whatsapp
exports.whatsappQuote = (req, res) => {
  const rates = ourRates();
  const compra = (rates.USD && rates.USD.compra) ?? 980;
  const venta = (rates.USD && rates.USD.venta) ?? 1000;
  const compraStr = formatPrice(compra);
  const ventaStr = formatPrice(venta);
  const text = `🏛️ GRUPO ALVAREZ - Cotización\nUSD Compra: $${compraStr} | Venta: $${ventaStr}\n_Actualizado al momento_`;
  return res.json({ text, compra, venta });
};
