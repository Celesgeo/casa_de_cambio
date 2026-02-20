import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Grid2 as Grid
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
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
  const [form, setForm] = React.useState<OperationFormState>({
    type: 'Compra',
    clientName: '',
    currency: 'USD',
    rate: '',
    amount: '',
    employeeName: '',
    paymentMethod: 'Efectivo',
    surchargePercent: ''
  });

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

  const columns: GridColDef<ExchangeOperation>[] = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 140 },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 160,
      valueFormatter(params: { value?: unknown }) {
        const val = params.value;
        return val != null ? new Date(String(val)).toLocaleString() : '';
      }
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1.2,
      minWidth: 160
    },
    {
      field: 'fromCurrency',
      headerName: 'From',
      flex: 0.6,
      minWidth: 80
    },
    {
      field: 'toCurrency',
      headerName: 'To',
      flex: 0.6,
      minWidth: 80
    },
    {
      field: 'amountFrom',
      headerName: 'Cantidad',
      flex: 0.8,
      minWidth: 100,
      valueFormatter(params: { value?: unknown }) {
        const v = Number(params.value);
        return Number.isNaN(v) ? '' : v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
    },
    {
      field: 'rateApplied',
      headerName: 'Cotización ($)',
      flex: 0.8,
      minWidth: 110,
      valueFormatter(params: { value?: unknown }) {
        const v = Number(params.value);
        return Number.isNaN(v) ? '' : v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
    },
    {
      field: 'totalARS',
      headerName: 'Total ARS',
      flex: 1,
      minWidth: 130,
      valueFormatter(params: { value?: unknown; row?: ExchangeOperation }) {
        const v = Number(params.value);
        const row = params.row;
        if (Number.isNaN(v) || v === 0) {
          if (row?.amountFrom != null && row?.rateApplied != null) {
            const calc = Number(row.amountFrom) * Number(row.rateApplied);
            return calc.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          }
          return '';
        }
        return v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
    },
    {
      field: 'montoFormula',
      headerName: 'Cálculo',
      flex: 1.2,
      minWidth: 180,
      valueGetter: (value: unknown, row: ExchangeOperation) => {
        const amt = Number(row?.amountFrom) || 0;
        const rate = Number(row?.rateApplied) || 0;
        const total = Number(row?.totalARS) ?? amt * rate;
        if (amt === 0 && rate === 0) return '';
        const amtStr = amt.toLocaleString('es-AR', { maximumFractionDigits: 2 });
        const rateStr = rate.toLocaleString('es-AR', { maximumFractionDigits: 2 });
        const totalStr = total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return `${amtStr} × ${rateStr} = $${totalStr}`;
      }
    },
    {
      field: 'branch',
      headerName: 'Branch',
      flex: 1,
      minWidth: 140
    },
    {
      field: 'teller',
      headerName: 'Teller',
      flex: 0.8,
      minWidth: 100
    }
  ];

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
      form.paymentMethod === 'Transferencia' && form.surchargePercent
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
      form.paymentMethod === 'Transferencia' && form.surchargePercent
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
      const payload: CreateOperationPayload = {
        type: form.type,
        clientName: form.clientName.trim(),
        currency: form.currency,
        rate: rateNum,
        amount: amountNum,
        employeeName: form.employeeName.trim(),
        paymentMethod: form.paymentMethod,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    label="Payment method"
                    size="small"
                    value={form.paymentMethod}
                    onChange={handleChange('paymentMethod')}
                    fullWidth
                  >
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                  </TextField>

                  {form.paymentMethod === 'Transferencia' && (
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
            <CardContent sx={{ height: 540, display: 'flex', flexDirection: 'column' }}>
              {loadError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {loadError}
                  <Button size="small" onClick={() => loadOperations()} sx={{ ml: 1 }}>
                    Reintentar
                  </Button>
                </Typography>
              )}
              <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  disableRowSelectionOnClick
                  autoHeight={false}
                  sx={{
                    height: '100%',
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }
                  }}
                  slots={{
                    toolbar: CustomToolbar
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const CustomToolbar: React.FC = () => {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Daily operations
      </Typography>
      <GridToolbarQuickFilter placeholder="Quick filter…" />
    </GridToolbarContainer>
  );
};

