'use client';

import { useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ReciboModalProps {
  venta: {
    id: string;
    items: Array<{
      producto: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
    total: number;
    cliente: string;
    vendedorNombre?: string;
    fechaString?: string;
  };
  onClose: () => void;
}

export function ReciboModal({ venta, onClose }: ReciboModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Recibo - ${venta.id.slice(0, 8)}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
                h1 { font-size: 18px; text-align: center; margin-bottom: 5px; }
                .info { font-size: 12px; margin-bottom: 15px; }
                table { width: 100%; font-size: 11px; border-collapse: collapse; }
                th, td { padding: 4px 0; text-align: left; border-bottom: 1px dashed #ccc; }
                th { border-bottom: 1px solid #000; }
                .total { font-size: 14px; font-weight: bold; text-align: right; margin-top: 10px; }
                .footer { font-size: 10px; text-align: center; margin-top: 20px; color: #666; }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">Recibo de Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div ref={printRef} className="p-4">
          <h1 className="mb-1 text-center text-xl font-bold">QUQI</h1>
          <p className="mb-4 text-center text-xs text-gray-600 italic">Sabor Costeño</p>
          <div className="mb-4 text-center text-sm text-gray-600">
            <p>Fecha: {venta.fechaString || new Date().toLocaleDateString('es-CO')}</p>
            <p>Folio: {venta.id.slice(0, 8).toUpperCase()}</p>
            <p>Cliente: {venta.cliente}</p>
            <p>Vendedor: {venta.vendedorNombre || 'N/A'}</p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-2 text-left">Producto</th>
                <th className="pb-2 text-center">Cant</th>
                <th className="pb-2 text-right">Precio</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.items.map((item, index) => (
                <tr key={index} className="border-b border-dashed border-gray-200">
                  <td className="py-2">{item.producto}</td>
                  <td className="py-2 text-center">{item.cantidad}</td>
                  <td className="py-2 text-right">{formatCurrency(item.precioUnitario)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 border-t border-gray-300 pt-2 text-right">
            <span className="text-lg font-bold">Total: {formatCurrency(venta.total)}</span>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Gracias por su compra
          </p>
        </div>

        <div className="flex gap-2 border-t p-4">
          <button
            onClick={handlePrint}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}