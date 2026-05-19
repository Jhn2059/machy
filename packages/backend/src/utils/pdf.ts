import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Prisma } from '@prisma/client';

interface SaleForBoleta {
  id: string;
  correlative: number;
  subtotal: Prisma.Decimal;
  igv: Prisma.Decimal;
  discount: Prisma.Decimal;
  total: Prisma.Decimal;
  createdAt: Date;
  user: { name: string };
  details: Array<{
    quantity: number;
    unitPrice: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    product: { name: string; barcode: string };
  }>;
}

interface BusinessConfig {
  name: string;
  ruc: string;
  address: string;
  phone: string;
}

export async function generateBoletaPDF(
  sale: SaleForBoleta,
  config: BusinessConfig,
): Promise<Buffer> {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(config.name, 40, 10, { align: 'center' });

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC: ${config.ruc}`, 40, 15, { align: 'center' });
  doc.text(config.address, 40, 19, { align: 'center' });
  doc.text(`Tel: ${config.phone}`, 40, 23, { align: 'center' });

  doc.setFontSize(7);
  doc.text(`Boleta N° ${String(sale.correlative).padStart(6, '0')}`, 40, 29, { align: 'center' });
  doc.text(
    `Fecha: ${new Date(sale.createdAt).toLocaleDateString('es-PE')} ${new Date(sale.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
    40,
    33,
    { align: 'center' },
  );
  doc.text(`Atendido por: ${sale.user.name}`, 40, 37, { align: 'center' });

  doc.line(3, 40, 77, 40);

  const rows = sale.details.map((d) => [
    d.product.name.substring(0, 20),
    d.quantity.toString(),
    Number(d.unitPrice).toFixed(2),
    Number(d.subtotal).toFixed(2),
  ]);

  (doc as any).autoTable({
    startY: 42,
    head: [['Producto', 'Cant', 'P.Unit', 'Subtotal']],
    body: rows,
    theme: 'plain',
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fontSize: 6, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' },
      3: { cellWidth: 18, halign: 'right' },
    },
    margin: { left: 3, right: 3 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 42;

  doc.line(3, finalY + 2, 77, finalY + 2);

  const xLeft = 3;
  const xRight = 73;
  let y = finalY + 6;

  doc.setFontSize(7);
  doc.text('Subtotal:', xLeft, y);
  doc.text(`S/ ${Number(sale.subtotal).toFixed(2)}`, xRight, y, { align: 'right' });

  y += 4;
  doc.text('IGV (18%):', xLeft, y);
  doc.text(`S/ ${Number(sale.igv).toFixed(2)}`, xRight, y, { align: 'right' });

  if (Number(sale.discount) > 0) {
    y += 4;
    doc.text('Descuento:', xLeft, y);
    doc.text(`S/ ${Number(sale.discount).toFixed(2)}`, xRight, y, { align: 'right' });
  }

  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', xLeft, y);
  doc.text(`S/ ${Number(sale.total).toFixed(2)}`, xRight, y, { align: 'right' });

  y += 8;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por su compra', 40, y, { align: 'center' });
  y += 3;
  doc.text(config.name, 40, y, { align: 'center' });

  const buffer = Buffer.from(doc.output('arraybuffer'));
  return buffer;
}
