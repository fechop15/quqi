'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

interface ReportData {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalVentas: number;
  ventasCount: number;
  productosVendidos: number;
  topProductos: { nombre: string; cantidad: number; total: number }[];
  ingresosPorCategoria: { categoria: string; total: number }[];
  egresosPorCategoria: { categoria: string; total: number }[];
  ingresosListado: { fecha: string; descripcion: string; monto: number }[];
  egresosListado: { fecha: string; descripcion: string; monto: number }[];
  ventasListado: { fecha: string; cliente: string; productos: number; total: number }[];
}

export function generatePDFReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('QUQI', 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Financiero', 14, 30);

  doc.setFontSize(10);
  doc.text(`Período: ${data.fechaInicio} - ${data.fechaFin}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 28, { align: 'right' });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', 14, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const resumenY = 65;
  const colWidth = 45;
  const rowHeight = 12;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, resumenY, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Ingresos', 14, resumenY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalIngresos), 14, resumenY + 14);

  doc.setFillColor(248, 250, 252);
  doc.rect(14 + colWidth + 5, resumenY, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Egresos', 14 + colWidth + 5, resumenY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalEgresos), 14 + colWidth + 5, resumenY + 14);

  doc.setFillColor(248, 250, 252);
  doc.rect(14 + (colWidth + 5) * 2, resumenY, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Balance', 14 + (colWidth + 5) * 2, resumenY + 8);
  doc.setFont('helvetica', 'normal');
  if (data.balance >= 0) {
    doc.setTextColor(16, 185, 129);
  } else {
    doc.setTextColor(239, 68, 68);
  }
  doc.text(formatCurrency(data.balance), 14 + (colWidth + 5) * 2, resumenY + 14);
  doc.setTextColor(30, 41, 59);

  doc.setFillColor(248, 250, 252);
  doc.rect(14, resumenY + rowHeight + 5, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Ventas Totales', 14, resumenY + rowHeight + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalVentas), 14, resumenY + rowHeight + 19);

  doc.setFillColor(248, 250, 252);
  doc.rect(14 + colWidth + 5, resumenY + rowHeight + 5, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Nro. Ventas', 14 + colWidth + 5, resumenY + rowHeight + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(data.ventasCount.toString(), 14 + colWidth + 5, resumenY + rowHeight + 19);

  doc.setFillColor(248, 250, 252);
  doc.rect(14 + (colWidth + 5) * 2, resumenY + rowHeight + 5, colWidth, rowHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Productos Vendidos', 14 + (colWidth + 5) * 2, resumenY + rowHeight + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(data.productosVendidos.toString(), 14 + (colWidth + 5) * 2, resumenY + rowHeight + 19);

  let currentY = resumenY + (rowHeight + 5) * 2 + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Productos Más Vendidos', 14, currentY);
  currentY += 5;

  if (data.topProductos.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Producto', 'Cantidad', 'Total']],
      body: data.topProductos.map(p => [p.nombre, p.cantidad.toString(), formatCurrency(p.total)]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay datos de productos en este período', 14, currentY + 10);
    currentY += 15;
  }

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingresos por Categoría', 14, currentY);
  currentY += 5;

  if (data.ingresosPorCategoria.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Categoría', 'Total']],
      body: data.ingresosPorCategoria.map(c => [c.categoria || 'Sin categoría', formatCurrency(c.total)]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay ingresos registrados en este período', 14, currentY + 10);
    currentY += 15;
  }

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Egresos por Categoría', 14, currentY);
  currentY += 5;

  if (data.egresosPorCategoria.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Categoría', 'Total']],
      body: data.egresosPorCategoria.map(c => [c.categoria || 'Sin categoría', formatCurrency(c.total)]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay egresos registrados en este período', 14, currentY + 10);
    currentY += 15;
  }

  doc.addPage();

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Transacciones', 14, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Últimas Ventas', 14, 30);

  if (data.ventasListado.length > 0) {
    autoTable(doc, {
      startY: 35,
      head: [['Fecha', 'Cliente', 'Productos', 'Total']],
      body: data.ventasListado.map(v => [v.fecha, v.cliente || 'Venta directa', v.productos.toString(), formatCurrency(v.total)]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay ventas registradas en este período', 14, 50);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Últimos Ingresos', 14, 130);

  if (data.ingresosListado.length > 0) {
    autoTable(doc, {
      startY: 135,
      head: [['Fecha', 'Descripción', 'Monto']],
      body: data.ingresosListado.map(i => [i.fecha, i.descripcion, formatCurrency(i.monto)]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay ingresos registrados en este período', 14, 150);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Últimos Egresos', 14, 210);

  if (data.egresosListado.length > 0) {
    autoTable(doc, {
      startY: 215,
      head: [['Fecha', 'Descripción', 'Monto']],
      body: data.egresosListado.map(e => [e.fecha, e.descripcion, formatCurrency(e.monto)]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No hay egresos registrados en este período', 14, 230);
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} - Quqi - ${new Date().toLocaleDateString('es-ES')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`quqi-reporte-${data.fechaInicio}-${data.fechaFin}.pdf`);
}
