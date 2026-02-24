import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import html2canvas from 'html2canvas';
import {
  deleteAllOperations,
  fetchClosingCalculation,
  fetchDashboardSummary,
  fetchExchangeOperations,
  fetchMarketRates,
  fetchOurRates,
  fetchPatrimony,
  fetchWhatsAppQuote,
  initPatrimony,
  syncOurRates
} from '../../lib/api';
import type { ClosingResult, DashboardSummary, ExchangeOperation, PatrimonyItem } from '../../lib/api';
import { safeStorage } from '../../lib/storage';

const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP'];
const COLORS = ['#4C8DFF', '#00E0B8', '#FFB74D', '#EF5350', '#AB47BC'];

const mockVolumeSeries = [
  { label: '09:00', value: 12000 },
  { label: '10:00', value: 18000 },
  { label: '11:00', value: 22000 },
  { label: '12:00', value: 20000 },
  { label: '13:00', value: 26000 },
  { label: '14:00', value: 28000 },
  { label: '15:00', value: 24000 }
];

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [operations, setOperations] = React.useState<ExchangeOperation[]>([]);
  const [patrimony, setPatrimony] = React.useState<PatrimonyItem[]>([]);
  const [marketRates, setMarketRates] = React.useState<{ compra: number; venta: number; source?: string } | null>(null);
  const [ourRates, setOurRates] = React.useState<{ USD: { compra: number; venta: number } } | null>(null);
  const [closing, setClosing] = React.useState<ClosingResult | null>(null);
  const [quoteCompra, setQuoteCompra] = React.useState<number | null>(null);
  const [quoteVenta, setQuoteVenta] = React.useState<number | null>(null);
  const [quoteUpdatedAt, setQuoteUpdatedAt] = React.useState<Date | null>(null);
  const quoteCardRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [refreshingRates, setRefreshingRates] = React.useState(false);
  const [initAmounts, setInitAmounts] = React.useState<Record<string, string>>(
    Object.fromEntries(CURRENCIES.map((c) => [c, '']))
  );
  const [tokenForLoad, setTokenForLoad] = React.useState<string | null>(() =>
    typeof window !== 'undefined' ? safeStorage.getItem('ga_token') : null
  );

  const loadAll = React.useCallback(async () => {
    const token = safeStorage.getItem('ga_token');
    console.log('Intentando cargar datos con token:', token ? `${token.substring(0, 12)}...` : 'NO HAY TOKEN');
    setLoading(true);
    setLoadError(null);
    try {
      const [s, ops, pat, market, ours, close] = await Promise.all([
        fetchDashboardSummary(),
        fetchExchangeOperations(),
        fetchPatrimony(),
        fetchMarketRates(),
        fetchOurRates(),
        fetchClosingCalculation()
      ]);
      console.log('Datos recibidos con éxito:', {
        summary: !!s,
        operationsCount: Array.isArray(ops) ? ops.length : 0,
        patrimonyCount: Array.isArray(pat) ? pat.length : 0,
        marketRates: !!market,
        ourRates: !!ours,
        closing: !!close
      });
      setSummary(s);
      setOperations(ops);
      setPatrimony(pat);
      setMarketRates(market);
      setOurRates(ours);
      setClosing(close);
    } catch (e) {
      console.error('Dashboard load error', e);
      const err = e as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar datos';
      const status = err?.response?.status;
      setLoadError(status === 401 ? 'Sesión expirada. Volvé a iniciar sesión.' : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setTokenForLoad(safeStorage.getItem('ga_token'));
  }, []);

  React.useEffect(() => {
    loadAll();
  }, [loadAll, tokenForLoad]);

  const handleUpdateRates = async () => {
    setSyncing(true);
    try {
      await syncOurRates();
      const ours = await fetchOurRates();
      setOurRates(ours);
    } catch (e) {
      console.error('Sync rates error', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleInitPatrimony = async () => {
    const entries = CURRENCIES.filter((c) => initAmounts[c] && Number(initAmounts[c]) >= 0).map((c) => ({
      currency: c,
      amount: Number(initAmounts[c])
    }));
    if (entries.length === 0) return;
    try {
      await initPatrimony(entries);
      await loadAll();
    } catch (e) {
      console.error('Init patrimony error', e);
    }
  };

  const handleResetPatrimony = async () => {
    if (typeof window !== 'undefined' && !window.confirm('¿Borrar todo el patrimonio y dejar todas las monedas en 0?')) return;
    try {
      await initPatrimony(CURRENCIES.map((c) => ({ currency: c, amount: 0 })));
      setInitAmounts(Object.fromEntries(CURRENCIES.map((c) => [c, ''])));
      await loadAll();
    } catch (e) {
      console.error('Reset patrimony error', e);
    }
  };

  const handleWhatsAppQuote = async () => {
    try {
      const q = await fetchWhatsAppQuote();
      setQuoteCompra(q.compra);
      setQuoteVenta(q.venta);
      setQuoteUpdatedAt(new Date());
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.warn('Quote fetch error', e);
    }
  };

  const formatQuoteNum = (n: number | null) =>
    n != null ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const handleDownloadQuoteImage = async () => {
    const el = quoteCardRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `cotizacion-grupo-alvarez-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download image error', e);
    }
  };

  const handleCopyQuoteImage = async () => {
    const el = quoteCardRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard?.write) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          } catch {
            // fallback: some browsers only support writeText
          }
        }
      }, 'image/png');
    } catch (e) {
      console.error('Copy image error', e);
    }
  };

  const handleDeleteAllOperations = async () => {
    if (typeof window !== 'undefined' && !window.confirm('¿Borrar todas las operaciones? Esta acción no se puede deshacer.')) return;
    try {
      await deleteAllOperations();
      await loadAll();
    } catch (e) {
      console.error('Delete operations error', e);
    }
  };

  const handleRefreshMarketRates = async () => {
    setRefreshingRates(true);
    try {
      const market = await fetchMarketRates();
      setMarketRates(market);
    } catch (e) {
      console.error('Refresh market rates error', e);
    } finally {
      setRefreshingRates(false);
    }
  };

  const topOperations = operations.slice(0, 5);
  const pieData = patrimony
    .filter((p) => p.amount > 0)
    .map((p) => ({ name: p.currency, value: p.amount }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {loadError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => loadAll()}>
              Reintentar
            </Button>
          }
          onClose={() => setLoadError(null)}
        >
          {loadError}
        </Alert>
      )}
      <Typography variant="h5" fontWeight={600}>
        Trading overview
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                Cotización actualizada
              </Typography>
              {loading ? (
                <Skeleton height={36} />
              ) : marketRates ? (
                <Typography variant="h6" fontWeight={600}>
                  Compra: ${marketRates.compra?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Venta: ${marketRates.venta?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">Sin datos</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Operaciones realizadas" value={operations.length} loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Patrimonio (ARS)"
            value={closing?.actualBalanceARS ?? patrimony.find((p) => p.currency === 'ARS')?.amount ?? null}
            prefix="$"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                Ganancia / Pérdida
              </Typography>
              {loading ? (
                <Skeleton height={36} />
              ) : closing?.gainLossPercent != null ? (
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={closing.gainLossPercent >= 0 ? 'success.main' : 'error.main'}
                >
                  {closing.gainLossPercent >= 0 ? '+' : ''}{closing.gainLossPercent.toFixed(2)}%
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">—</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Market Price + Update Our Rates */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Cotización en tiempo real (Dólar Blue)
              </Typography>
              {loading ? (
                <Skeleton height={60} />
              ) : marketRates ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography>Compra: ${marketRates.compra?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    <Typography>Venta: ${marketRates.venta?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    <Button size="small" variant="outlined" onClick={handleRefreshMarketRates} disabled={refreshingRates}>
                      {refreshingRates ? 'Actualizando…' : 'Actualizar'}
                    </Button>
                  </Box>
                  {marketRates.source && (
                    <Typography variant="caption" color="text.secondary">
                      Fuente:{' '}
                      {marketRates.source === 'cronista.com' ? (
                        <a href="https://www.cronista.com/MercadosOnline/moneda/ARSB/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          El Cronista
                        </a>
                      ) : marketRates.source === 'dolarhoy.com' ? (
                        <a href="https://dolarhoy.com/cotizaciondolarblue" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          DolarHoy.com
                        </a>
                      ) : marketRates.source === 'dolarapi.com' ? (
                        <a href="https://dolarapi.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          DolarAPI.com
                        </a>
                      ) : (
                        marketRates.source
                      )}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography color="text.secondary">Sin datos</Typography>
                  <Button size="small" variant="outlined" onClick={handleRefreshMarketRates} disabled={refreshingRates}>
                    Cargar cotización
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Our rates
              </Typography>
              {ourRates?.USD ? (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography>USD Compra: ${ourRates.USD.compra} | Venta: ${ourRates.USD.venta}</Typography>
                  <Button variant="contained" size="small" onClick={handleUpdateRates} disabled={syncing}>
                    {syncing ? 'Updating…' : 'Update our rates'}
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" size="small" onClick={handleUpdateRates} disabled={syncing}>
                  {syncing ? 'Updating…' : 'Update our rates'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patrimony Management */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Patrimony management
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Set initial capital per currency (USD, ARS, EUR, BRL, CLP). Compra subtracts ARS and adds FX; Venta adds ARS and subtracts FX.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {CURRENCIES.map((c) => (
              <Grid size={{ xs: 12, sm: 6, md: 2 }} key={c}>
                <TextField
                  size="small"
                  label={`${c} amount`}
                  type="number"
                  value={initAmounts[c]}
                  onChange={(e) => setInitAmounts((prev) => ({ ...prev, [c]: e.target.value }))}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="outlined" onClick={handleInitPatrimony}>
                Save initial capital
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="outlined" color="error" onClick={handleResetPatrimony} disabled={patrimony.length === 0}>
                Borrar patrimonio
              </Button>
            </Grid>
          </Grid>
          {patrimony.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {patrimony.map((p) => (
                <Typography key={p.currency} variant="body2">
                  {p.currency}: {p.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* PieChart + Volume + Latest ops */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 280 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Patrimony distribution
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No patrimony data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 280 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Intraday volume (mock)
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={mockVolumeSeries}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4C8DFF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4C8DFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#4C8DFF" fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 280 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Latest operations</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteAllOperations}
                  disabled={loading || topOperations.length === 0}
                >
                  Borrar operaciones
                </Button>
              </Box>
              {loading ? (
                <Skeleton height={36} />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topOperations.map((op) => {
                    const amountStr = op.amountFrom != null ? op.amountFrom.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0';
                    const totalStr = op.totalARS != null ? op.totalARS.toLocaleString('es-AR', { maximumFractionDigits: 0 }) : '0';
                    const line = `${op.type.toLowerCase()} - ${op.customerName} • ${op.fromCurrency}→${op.toCurrency} $${amountStr} @ ${op.rateApplied?.toLocaleString('es-AR') ?? ''} =${totalStr}`;
                    return (
                      <Box key={op.id} sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {line}
                        </Typography>
                      </Box>
                    );
                  })}
                  {topOperations.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No operations
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calculadora de Cierre + WhatsApp Quote */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Calculadora de cierre
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Expected = Initial patrimony + Total sales (ARS) - Total buys (ARS). Compare with actual balance.
              </Typography>
              {closing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2">Initial patrimony ARS: ${closing.initialPatrimonyARS?.toLocaleString()}</Typography>
                  <Typography variant="body2">Total buys (ARS): ${closing.totalBuysARS?.toLocaleString()}</Typography>
                  <Typography variant="body2">Total sales (ARS): ${closing.totalSalesARS?.toLocaleString()}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Expected balance: ${closing.expectedBalanceARS?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Actual balance: ${closing.actualBalanceARS?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color={closing.difference === 0 ? 'success.main' : 'warning.main'}>
                    Difference: ${closing.difference?.toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Load data to see closing
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Cotización para WhatsApp
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Generá la cotización, editá los valores y descargá o copiá la imagen para compartir.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Button variant="contained" onClick={handleWhatsAppQuote}>
                  Generar cotización
                </Button>
                <Button variant="outlined" onClick={handleDownloadQuoteImage} disabled={quoteCompra == null && quoteVenta == null}>
                  Descargar imagen
                </Button>
                <Button variant="outlined" onClick={handleCopyQuoteImage} disabled={quoteCompra == null && quoteVenta == null}>
                  Copiar imagen
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="Compramos ($)"
                  type="number"
                  value={quoteCompra ?? ''}
                  onChange={(e) => {
                    setQuoteCompra(e.target.value ? Number(e.target.value) : null);
                    setQuoteUpdatedAt(new Date());
                  }}
                  sx={{ width: 140 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  size="small"
                  label="Vendemos ($)"
                  type="number"
                  value={quoteVenta ?? ''}
                  onChange={(e) => {
                    setQuoteVenta(e.target.value ? Number(e.target.value) : null);
                    setQuoteUpdatedAt(new Date());
                  }}
                  sx={{ width: 140 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Box>
              {/* Tarjeta visual para captura como imagen */}
              <Box
                ref={quoteCardRef}
                sx={{
                  width: 400,
                  maxWidth: '100%',
                  mx: 'auto',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 4,
                  background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #0d47a1 100%)',
                  color: '#fff',
                  p: 2.5,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
                  Cotización
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, mb: 1.5 }}>
                  🏛️ GRUPO ALVAREZ
                </Typography>
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    USD Compramos: ${formatQuoteNum(quoteCompra)}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    USD Vendemos: ${formatQuoteNum(quoteVenta)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, opacity: 0.85, fontStyle: 'italic' }}>
                  {quoteUpdatedAt
                    ? `Actualizado: ${quoteUpdatedAt.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}`
                    : 'Actualizado al momento'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  loading
}: {
  label: string;
  value?: number | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
          {label}
        </Typography>
        {loading || value == null ? (
          <Skeleton width="70%" height={36} />
        ) : (
          <Typography variant="h5" fontWeight={600}>
            {prefix}
            {value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
            {suffix}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
