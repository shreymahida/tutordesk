import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportProgressPDF({ student, notes, sessions }) {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(139, 92, 246) // violet-600
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Progress Report', 14, 19)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('TutorHQ', 196, 19, { align: 'right' })

  // Student info
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(student.name, 14, 44)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`${student.grade} Grade · ${(student.subjects || []).join(', ')}`, 14, 51)
  doc.text(`Report generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 57)

  // Summary stats
  const completed = sessions.filter(s => s.status === 'completed').length
  const upcoming = sessions.filter(s => s.status === 'scheduled').length
  const totalHours = sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.duration / 60), 0)
  const avgRating = notes.length ? (notes.reduce((s, n) => s + n.rating, 0) / notes.length).toFixed(1) : '—'

  doc.setFillColor(243, 244, 246)
  doc.rect(14, 64, 182, 24, 'F')
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('SESSIONS', 22, 72); doc.text('HOURS LOGGED', 70, 72); doc.text('AVG RATING', 130, 72); doc.text('UPCOMING', 170, 72)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(String(completed), 22, 82); doc.text(totalHours.toFixed(1), 70, 82); doc.text(String(avgRating), 130, 82); doc.text(String(upcoming), 170, 82)

  // Progress notes table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 20, 20)
  doc.text('Progress Notes', 14, 100)

  if (notes.length > 0) {
    autoTable(doc, {
      startY: 104,
      head: [['Date', 'Subject', 'Rating', 'Notes']],
      body: notes.map(n => [
        new Date(n.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        n.subject || '—',
        '★'.repeat(n.rating) + '☆'.repeat(5 - n.rating),
        n.content,
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 28 }, 2: { cellWidth: 28 }, 3: { cellWidth: 'auto' } },
      theme: 'striped',
    })
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('No progress notes recorded yet.', 14, 110)
  }

  // Session log
  const finalY = doc.lastAutoTable?.finalY || 110
  if (finalY < 240) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text('Recent Sessions', 14, finalY + 12)

    const recent = sessions
      .filter(s => s.status === 'completed')
      .slice(0, 15)

    if (recent.length > 0) {
      autoTable(doc, {
        startY: finalY + 16,
        head: [['Date', 'Subject', 'Duration', 'Status']],
        body: recent.map(s => [
          new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          s.subject,
          `${s.duration} min`,
          s.status,
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
      })
    }
  }

  doc.save(`${student.name.replace(/\s+/g, '-')}-progress-report.pdf`)
}
