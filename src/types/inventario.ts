export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface MovimientoInventario {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: any;
}
