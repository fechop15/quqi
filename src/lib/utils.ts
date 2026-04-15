/**
 * Formatea un número como moneda colombiana (COP)
 * Sin decimales, separador de miles con punto
 * Ej: 1234567 -> $1.234.567
 */
export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}
