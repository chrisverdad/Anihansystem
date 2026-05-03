import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ReportBlock {
  title: string
  head: string[]
  body: (string | number)[][]
}

function sanitizeSheetName(title: string, index: number): string {
  const cleaned = title.replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31)
  return cleaned || `Sheet${index}`
}

/** One Excel sheet per block (title = sheet name). */
export function downloadExcelReport(filename: string, blocks: ReportBlock[]) {
  const wb = XLSX.utils.book_new()
  blocks.forEach((block, i) => {
    const aoa = [block.head, ...block.body]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(block.title, i + 1))
  })
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

/** Single PDF with titled sections and tables. */
export function downloadPdfReport(title: string, filename: string, blocks: ReportBlock[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  let y = 16
  doc.setFontSize(15)
  doc.text(title, 14, y)
  y += 8
  doc.setFontSize(9)
  doc.setTextColor(90)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y)
  y += 10
  doc.setTextColor(0)

  for (const block of blocks) {
    if (y > 270) {
      doc.addPage()
      y = 16
    }
    doc.setFontSize(11)
    doc.setTextColor(30)
    doc.text(block.title, 14, y)
    y += 5
    autoTable(doc, {
      startY: y,
      head: [block.head.map(String)],
      body: block.body.map(row => row.map(cell => String(cell))),
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 }
    })
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
    y = (finalY ?? y) + 12
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
