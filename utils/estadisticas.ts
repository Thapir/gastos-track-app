import { CATEGORIAS_FIJAS } from '@/constants/categorias';
import { Gasto } from './gastosService';

export type TopCategoria = {
  label: string;
  value: string;
  bgColor: string;
  total: number;
  porcentaje: number;
};

export type DatoPie = {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

export type DatoLinea = {
  labels: string[];
  datasets: { data: number[] }[];
};

export type Comparacion = {
  diff: number;
  porcentaje: number;
  tendencia: 'up' | 'down' | 'same';
};

const colorPorCategoria: Record<string, string> = {};
CATEGORIAS_FIJAS.forEach((c) => { colorPorCategoria[c.value] = c.bgColor; });

const labelPorCategoria: Record<string, string> = {};
CATEGORIAS_FIJAS.forEach((c) => { labelPorCategoria[c.value] = c.label; });

const colorPaleta = [
  '#a3e635', '#3b82f6', '#ef4444', '#f97316',
  '#a855f7', '#22c55e', '#ec4899', '#06b6d4',
  '#eab308', '#14b8a6',
];

const getColor = (value: string, idx: number): string =>
  colorPorCategoria[value] ?? colorPaleta[idx % colorPaleta.length];

const getLabel = (value: string): string =>
  labelPorCategoria[value] ?? value;

// ─── Top N categorias ─────────────────────────────────────────────────────

export const calcularTopCategorias = (gastos: Gasto[], n: number = 3): TopCategoria[] => {
  const total = gastos.reduce((acc, g) => acc + g.monto, 0);
  if (total === 0) return [];

  const porCategoria: Record<string, number> = {};
  gastos.forEach((g) => {
    porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + g.monto;
  });

  return Object.entries(porCategoria)
    .map(([value, monto], idx) => ({
      label: getLabel(value),
      value,
      bgColor: getColor(value, idx),
      total: monto,
      porcentaje: (monto / total) * 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
};

// ─── Datos para grafico de torta ──────────────────────────────────────────

export const calcularDatosPie = (gastos: Gasto[]): DatoPie[] => {
  const porCategoria: Record<string, number> = {};
  gastos.forEach((g) => {
    porCategoria[g.categoria] = (porCategoria[g.categoria] ?? 0) + g.monto;
  });

  return Object.entries(porCategoria)
    .map(([value, monto], idx) => ({
      name: getLabel(value),
      population: Math.round(monto),
      color: getColor(value, idx),
      legendFontColor: '#d4d4d4',
      legendFontSize: 12,
    }))
    .sort((a, b) => b.population - a.population);
};

// ─── Datos para grafico de linea (acumulado por dia) ──────────────────────

export const calcularDatosLinea = (
  gastos: Gasto[],
  mes: number,
  año: number
): DatoLinea => {
  const diasEnMes = new Date(año, mes + 1, 0).getDate();
  const acumuladoPorDia: number[] = new Array(diasEnMes).fill(0);

  // Sumar gastos por dia
  gastos.forEach((g) => {
    const dia = new Date(g.fecha).getDate();
    if (dia >= 1 && dia <= diasEnMes) {
      acumuladoPorDia[dia - 1] += g.monto;
    }
  });

  // Convertir en acumulado progresivo
  for (let i = 1; i < acumuladoPorDia.length; i++) {
    acumuladoPorDia[i] += acumuladoPorDia[i - 1];
  }

  // Etiquetas: mostrar cada 5 dias para no saturar
  const labels = acumuladoPorDia.map((_, i) => {
    const dia = i + 1;
    if (dia === 1 || dia === diasEnMes || dia % 5 === 0) return String(dia);
    return '';
  });

  return {
    labels,
    datasets: [{ data: acumuladoPorDia }],
  };
};

// ─── Comparacion contra mes anterior ──────────────────────────────────────

export const calcularComparacion = (
  totalActual: number,
  totalAnterior: number
): Comparacion => {
  if (totalAnterior === 0) {
    return { diff: totalActual, porcentaje: 0, tendencia: totalActual > 0 ? 'up' : 'same' };
  }
  const diff = totalActual - totalAnterior;
  const porcentaje = (diff / totalAnterior) * 100;
  const tendencia: 'up' | 'down' | 'same' =
    Math.abs(porcentaje) < 0.5 ? 'same' : diff > 0 ? 'up' : 'down';
  return { diff, porcentaje, tendencia };
};
