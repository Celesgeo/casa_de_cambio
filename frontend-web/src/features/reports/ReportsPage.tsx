import React from 'react';
import { Box, Button, Card, CardContent, Grid2 as Grid, Skeleton, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx-js-style';
import { fetchDailyBalance } from '../../lib/api';
import type { DailyBalanceReport, DailyBalanceReportOp } from '../../lib/api';

function formatDateForFilename(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

const headerStyle = {
  font: { bold: true, sz: 12 },
  fill: { fgColor: { rgb: '1a237e' } },
  alignment: { horizontal: 'center' }
};
const gainStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2e7d32' } } };
const lossStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: 'c62828' } } };
const labelStyle = { font: { bold: true } };

function exportBalanceToExcel(report: DailyBalanceReport) {
  const wb = XLSX.utils.book_new();
  const rows: (string | number)[][] = [];
  const styles: Record<string, object> = {};

  const addRow = (cells: (string | number)[], rowStyles?: object[]) => {
    const r = rows.length + 1;
    cells.forEach((v, c) => {
      const col = String.fromCharCode(65 + c);
      const ref = col + r;
      styles[ref] = rowStyles?.[c] || {};
    });
    rows.push(cells);
  };

  addRow(['REPORTE DE BALANCE DEL DÍA'], [headerStyle]);
  addRow([`Fecha: ${report.date}`], [labelStyle]);
  addRow([]);
  addRow(['Resumen'], [labelStyle]);
  addRow(['USD comprados', report.usdComprados], [labelStyle, { numFmt: '#,##0.00' }]);
  addRow(['USD vendidos', report.usdVendidos], [labelStyle, { numFmt: '#,##0.00' }]);
  addRow(['Total ARS compras', report.totalARSCompras], [labelStyle, { numFmt: '#,##0.00' }]);
  addRow(['Total ARS ventas', report.totalARSVentas], [labelStyle, { numFmt: '#,##0.00' }]);
  addRow([]);

  const ganancia = report.gananciaEstimadaARS;
  const gs = ganancia >= 0 ? gainStyle : lossStyle;
  addRow([ganancia >= 0 ? 'Ganancia (ARS)' : 'Pérdida (ARS)', ganancia], [gs, { ...gs, numFmt: '#,##0.00' }]);
  addRow([]);

  const ops = report.operations || [];
  if (ops.length > 0) {
    addRow(['Detalle de operaciones'], [headerStyle]);
    const headerStyleLight = { font: { bold: true }, fill: { fgColor: { rgb: 'e3f2fd' } } };
    addRow(['Hora', 'Tipo', 'Cliente', 'Moneda', 'Cantidad', 'Cotiz.', 'Total ARS', 'Medio pago', 'Empleado'], Array(9).fill(headerStyleLight));
    (ops as DailyBalanceReportOp[]).forEach((op) => {
      const dt = op.createdAt ? new Date(op.createdAt).toLocaleString('es-AR', { timeStyle: 'short' }) : '';
      const typeStyle = op.type === 'Venta' ? { font: { color: { rgb: '2e7d32' } } } : { font: { color: { rgb: 'c62828' } } };
      addRow(
        [dt, op.type, op.clientName || '', op.currency || '', op.amount ?? 0, op.rate ?? 0, op.totalARS ?? 0, op.paymentMethod || '', op.employeeName || ''],
        [{}, typeStyle, {}, {}, { numFmt: '#,##0.00' }, { numFmt: '#,##0.00' }, { numFmt: '#,##0.00' }, {}, {}]
      );
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  Object.entries(styles).forEach(([ref, s]) => {
    if (ws[ref]) (ws[ref] as { s?: object }).s = s;
  });
  XLSX.utils.book_append_sheet(wb, ws, 'Balance');
  const filename = `balance_${formatDateForFilename(report.date)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export const ReportsPage: React.FC = () => {
  const [report, setReport] = React.useState<DailyBalanceReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyBalance();
      setReport(data);
    } catch (e) {
      console.error('Reports load error', e);
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message || err?.message || 'Error al cargar el balance');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    if (report) exportBalanceToExcel(report);
  };

  return (
    <Box
      component="section"
      aria-label="Reports"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        minHeight: 320,
        color: 'text.primary'
      }}
    >
      <Typography variant="h5" fontWeight={600}>
        Reporte automático del día
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Balance del día
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Skeleton height={32} />
                  <Skeleton height={32} />
                  <Skeleton height={32} />
                  <Skeleton height={40} />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : report ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography>
                    <strong>USD comprados:</strong>{' '}
                    {report.usdComprados.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography>
                    <strong>USD vendidos:</strong>{' '}
                    {report.usdVendidos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                    Ganancia estimada:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: report.gananciaEstimadaARS >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${report.gananciaEstimadaARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fecha: {report.date}
                  </Typography>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Exportar balance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Descarga un Excel profesional con resumen, ganancias/pérdidas en color y detalle de operaciones.
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={!report || loading}
              >
                Exportar balance
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
