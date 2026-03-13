import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Grid2 as Grid,
  Paper
} from '@mui/material';
import { createOperation, fetchExchangeOperations } from '../../lib/api';
import type { ExchangeOperation, CreateOperationPayload } from '../../lib/api';

type OperationFormState = {
  type: CreateOperationPayload['type'];
  clientName: string;
  currency: CreateOperationPayload['currency'];
  rate: string;
  amount: string;
  employeeName: string;
  paymentMethod: CreateOperationPayload['paymentMethod'];
  // Optional second payment method for split payments (e.g. half cash, half transfer)
  paymentMethod2: CreateOperationPayload['paymentMethod'] | '';
  splitPercentFirst: string; // percentage for primary method (0-100)
  surchargePercent: string;
};

function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const ax = err as { response?: { data?: { message?: string }; status?: number } };
    if (ax.response?.data?.message) return ax.response.data.message;
    if (ax.response?.status === 400) return 'Datos inválidos. Revisá los campos.';
    if (ax.response?.status === 401) return 'No autorizado. Iniciá sesión si es necesario.';
    if (ax.response?.status === 500) return 'Error del servidor. Intentá de nuevo.';
  }
  if (err instanceof Error) return err.message;
  return 'Error al conectar con el servidor. ¿Está corriendo el backend?';
}

export const OperationsPage: React.FC = () => {
  const [rows, setRows] = React.useState<ExchangeOperation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [quickFilter, setQuickFilter] = React.useState('');
  const [form, setForm] = React.useState<OperationFormState>({
    type: 'Compra',
    clientName: '',
    currency: 'USD',
    rate: '',
    amount: '',
    employeeName: '',
    paymentMethod: 'Efectivo',
    paymentMethod2: '',
    splitPercentFirst: '50',
    surchargePercent: ''
  });

  const filteredRows = React.useMemo(() => {
    if (!quickFilter.trim()) return rows;
    const q = quickFilter.toLowerCase();
    return rows.filter(
      (r) =>
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.teller || '').toLowerCase().includes(q)
    );
  }, [rows, quickFilter]);

  const rowsByDate = React.useMemo(() => {
    const map = new Map<string, ExchangeOperation[]>();
    filteredRows.forEach((r) => {
      const d = r.date ? new Date(String(r.date)).toISOString().slice(0, 10) : '';
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(r);
    });
    return Array.from(map.entries()).sort(([a], [b]) => (b || '').localeCompare(a || ''));
  }, [filteredRows]);

  const loadOperations = React.useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await fetchExchangeOperations();
      setRows(data);
    } catch (err) {
      console.error('Failed to load operations', err);
      setLoadError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOperations();
  }, [loadOperations]);


  const handleChange =
    (field: keyof OperationFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const targetValue = (event.target as HTMLInputElement).value;
      setForm((prev) => ({ ...prev, [field]: targetValue }));
    };

  // Calculate adjusted rate preview
  const calculateAdjustedRate = (): number | null => {
    if (!form.rate) return null;

    const rateNum = Number(form.rate);
    if (Number.isNaN(rateNum) || rateNum <= 0) return null;

    const surchargeNum =
      (form.paymentMethod === 'Transferencia' || form.paymentMethod === 'Mixto') && form.surchargePercent
        ? Number(form.surchargePercent)
        : 0;
    if (Number.isNaN(surchargeNum) || surchargeNum <= 0) {
      return rateNum;
    }

    return rateNum + (rateNum * surchargeNum) / 100;
  };

  const adjustedRate = calculateAdjustedRate();

  // Total ARS en tiempo real: cotización (ajustada si hay recargo) × cantidad
  const totalARSForm =
    adjustedRate != null && form.amount && Number(form.amount) > 0
      ? Math.round(adjustedRate * Number(form.amount) * 100) / 100
      : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic required-field validation
    if (
      !form.type ||
      !form.clientName.trim() ||
      !form.currency ||
      !form.rate ||
      !form.amount ||
      !form.employeeName.trim() ||
      !form.paymentMethod
    ) {
      if (typeof window !== 'undefined' && window.alert) window.alert('Please fill in all required fields.');
      return;
    }

    const rateNum = Number(form.rate);
    const amountNum = Number(form.amount);
    const surchargeNum =
      (form.paymentMethod === 'Transferencia' || form.paymentMethod === 'Mixto') && form.surchargePercent
        ? Number(form.surchargePercent)
        : 0;

    if (
      Number.isNaN(rateNum) ||
      rateNum <= 0 ||
      Number.isNaN(amountNum) ||
      amountNum <= 0
    ) {
      if (typeof window !== 'undefined' && window.alert) window.alert('Rate and amount must be valid numbers greater than 0.');
      return;
    }

    if (Number.isNaN(surchargeNum) || surchargeNum < 0) {
      if (typeof window !== 'undefined' && window.alert) window.alert('Surcharge must be a valid non-negative number.');
      return;
    }

    const totalARSNum =
      adjustedRate != null && adjustedRate > 0 && amountNum > 0
        ? Math.round(adjustedRate * amountNum * 100) / 100
        : rateNum * amountNum;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const isSplit = form.paymentMethod === 'Mixto' && form.paymentMethod2;
      const splitPercent = Math.min(
        100,
        Math.max(0, Number(form.splitPercentFirst || '50'))
      );
      const secondPercent = isSplit ? 100 - splitPercent : 0;

      const splitLabel = isSplit
        ? `${form.paymentMethod} ${splitPercent.toFixed(0)}% / ${form.paymentMethod2} ${secondPercent.toFixed(0)}%`
        : undefined;

      const payload: CreateOperationPayload = {
        type: form.type,
        clientName: form.clientName.trim(),
        currency: form.currency,
        rate: rateNum,
        amount: amountNum,
        employeeName: form.employeeName.trim(),
        paymentMethod: form.paymentMethod,
        paymentSplit: splitLabel,
        surchargePercent: surchargeNum,
        totalARS: totalARSNum
      };
      await createOperation(payload);
      // Clear form except Type and Currency for fast repeat entry
      setForm((prev) => ({
        type: prev.type,
        currency: prev.currency,
        clientName: '',
        rate: '',
        amount: '',
        employeeName: '',
        paymentMethod: 'Efectivo',
        paymentMethod2: '',
        splitPercentFirst: '50',
        surchargePercent: ''
      }));
      await loadOperations();
    } catch (err) {
      console.error('Failed to create operation', err);
      const msg = getApiErrorMessage(err);
      setSubmitError(msg);
      if (typeof window !== 'undefined' && window.alert) window.alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h5" fontWeight={600}>
        Currency exchange operations
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                New operation
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Register a Compra or Venta. Select payment method and apply
                surcharge for transfers. Values are converted to ARS automatically.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Stack spacing={1.5}>
                  <TextField
                    select
                    label="Type"
                    size="small"
                    value={form.type}
                    onChange={handleChange('type')}
                    fullWidth
                  >
                    <MenuItem value="Compra">Compra</MenuItem>
                    <MenuItem value="Venta">Venta</MenuItem>
                  </TextField>

                  <TextField
                    label="Client name"
                    size="small"
                    value={form.clientName}
                    onChange={handleChange('clientName')}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      select
                      label="Currency"
                      size="small"
                      value={form.currency}
                      onChange={handleChange('currency')}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                    </TextField>

                    <TextField
                      label="Cotización ($)"
                      type="number"
                      size="small"
                      value={form.rate}
                      onChange={handleChange('rate')}
                      fullWidth
                      inputProps={{ min: 0, step: '0.01' }}
                    />
                  </Stack>

                  <TextField
                    label="Cantidad de Moneda Extranjera"
                    type="number"
                    size="small"
                    value={form.amount}
                    onChange={handleChange('amount')}
                    fullWidth
                    inputProps={{ min: 0, step: '0.01' }}
                  />

                  <TextField
                    label="Total ARS"
                    size="small"
                    value={totalARSForm != null ? totalARSForm.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    placeholder="Se calcula al ingresar Cotización y Cantidad"
                  />

                  <TextField
                    select
                    label="Payment method (primary)"
                    size="small"
                    value={form.paymentMethod}
                    onChange={handleChange('paymentMethod')}
                    fullWidth
                  >
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                    <MenuItem value="Mixto">Mixto (dos medios)</MenuItem>
                  </TextField>

                  {form.paymentMethod === 'Mixto' && (
                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        select
                        label="2º medio de pago"
                        size="small"
                        value={form.paymentMethod2}
                        onChange={handleChange('paymentMethod2')}
                        sx={{ minWidth: 160 }}
                      >
                        <MenuItem value="">Seleccionar…</MenuItem>
                        <MenuItem value="Efectivo">Efectivo</MenuItem>
                        <MenuItem value="Transferencia">Transferencia</MenuItem>
                      </TextField>
                      <TextField
                        label="% primer medio"
                        type="number"
                        size="small"
                        value={form.splitPercentFirst}
                        onChange={handleChange('splitPercentFirst')}
                        sx={{ minWidth: 120 }}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        helperText="Ej: 50 = mitad y mitad"
                      />
                    </Stack>
                  )}

                  {(form.paymentMethod === 'Transferencia' || form.paymentMethod === 'Mixto') && (
                    <TextField
                      label="Surcharge %"
                      type="number"
                      size="small"
                      value={form.surchargePercent}
                      onChange={handleChange('surchargePercent')}
                      fullWidth
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Additional percentage applied to rate for transfers"
                    />
                  )}

                  {adjustedRate != null && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                        Adjusted rate
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {adjustedRate.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2
                        })}
                      </Typography>
                      {form.paymentMethod === 'Transferencia' &&
                        Number(form.surchargePercent || 0) > 0 && (
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Base: {Number(form.rate || 0).toLocaleString(undefined, {
                              maximumFractionDigits: 2
                            })} + {Number(form.surchargePercent || 0).toFixed(2)}%
                          </Typography>
                        )}
                    </Box>
                  )}

                  <TextField
                    label="Employee name"
                    size="small"
                    value={form.employeeName}
                    onChange={handleChange('employeeName')}
                    fullWidth
                  />

                  {submitError && (
                    <Typography variant="body2" color="error">
                      {submitError}
                    </Typography>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    disabled={submitting}
                  >
                    {submitting ? 'Guardando…' : 'Registrar operación'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
              {loadError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {loadError}
                  <Button size="small" onClick={() => loadOperations()} sx={{ ml: 1 }}>
                    Reintentar
                  </Button>
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Operaciones por fecha
                </Typography>
                <TextField
                  size="small"
                  placeholder="Filtrar por cliente, empleado…"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  sx={{ ml: 'auto', minWidth: 200 }}
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <Typography color="text.secondary">Cargando…</Typography>
                ) : rowsByDate.length === 0 ? (
                  <Typography color="text.secondary">No hay operaciones</Typography>
                ) : (
                  rowsByDate.map(([dateKey, dateRows]) => {
                    const dateLabel =
                      dateKey && dateKey !== 'undefined'
                        ? new Date(dateKey + 'T12:00:00').toLocaleDateString('es-AR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Sin fecha';
                    return (
                      <Box key={dateKey} sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{ mb: 1, textTransform: 'capitalize', color: 'primary.main' }}
                        >
                          {dateLabel}
                        </Typography>
                        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell>Hora</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Moneda</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Cotiz.</TableCell>
                                <TableCell align="right">Total ARS</TableCell>
                                <TableCell>Empleado</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {dateRows.map((r) => (
                                <TableRow key={r.id} hover>
                                  <TableCell>
                                    {r.date
                                      ? new Date(String(r.date)).toLocaleTimeString('es-AR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : '—'}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      sx={{ color: r.type === 'Venta' ? 'success.main' : 'error.main', fontWeight: 600 }}
                                    >
                                      {r.type}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{r.customerName || '—'}</TableCell>
                                  <TableCell>{r.fromCurrency || '—'}</TableCell>
                                  <TableCell align="right">
                                    {Number(r.amountFrom || 0).toLocaleString('es-AR', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 2
                                    })}
                                  </TableCell>
                                  <TableCell align="right">
                                    {Number(r.rateApplied || 0).toLocaleString('es-AR', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 2
                                    })}
                                  </TableCell>
                                  <TableCell align="right">
                                    {(
                                      Number(r.totalARS) ||
                                      Number(r.amountFrom || 0) * Number(r.rateApplied || 0)
                                    ).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </TableCell>
                                  <TableCell>{r.teller || '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      </Box>
                    );
                  })
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

