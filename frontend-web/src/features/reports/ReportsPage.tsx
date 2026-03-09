import React from 'react';
import { Box, Button, Card, CardContent, Grid2 as Grid, Skeleton, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { fetchDailyBalance } from '../../lib/api';
import type { DailyBalanceReport } from '../../lib/api';

function formatDateForFilename(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

function exportBalanceToExcel(report: DailyBalanceReport) {
  const sheetData = [
    ['Balance del día', report.date],
    ['USD comprados', report.usdComprados],
    ['USD vendidos', report.usdVendidos],
    ['Ganancia estimada (ARS)', report.gananciaEstimadaARS],
    [],
    ['Total ARS compras', report.totalARSCompras],
    ['Total ARS ventas', report.totalARSVentas]
  ];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
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
                  <Typography variant="h6" color="primary" fontWeight={700}>
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
                Descarga un archivo Excel con el balance del día (balance_DD-MM-AAAA.xlsx).
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
