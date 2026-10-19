// src/utils/generateBill.js
import { formatTime12 } from './timeFormat.js'

export function generateBill({
  receiptNumber,
  patientName,
  doctorName,
  doctorSpecialization,
  appointmentDate,
  appointmentTime,
  amount,
  paymentMethod,
  status = 'PAID',
  paidAt,
}) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    // ✅ Changed from alert() to console.error to prevent popups
    console.error('Please allow pop-ups to download the bill.')
    return
  }

  const billDate = paidAt ? new Date(paidAt).toLocaleString() : new Date().toLocaleString()

  let formattedTime = appointmentTime || '—'
  if (
    appointmentTime &&
    appointmentTime.includes(':') &&
    !appointmentTime.toUpperCase().includes('AM') &&
    !appointmentTime.toUpperCase().includes('PM')
  ) {
    try {
      formattedTime = formatTime12(appointmentTime)
    } catch {
      formattedTime = appointmentTime
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hospivexa - Payment Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #f8fafc; margin: 0; }
    .receipt-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px dashed #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4f46e5; margin: 0; font-size: 36px; letter-spacing: 1px; }
    .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; flex-wrap: wrap; }
    .details-col { flex: 1; min-width: 180px; }
    .details-col h3 { margin-bottom: 10px; font-size: 13px; color: #555; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    .details-col p { margin: 6px 0; font-size: 15px; }
    .details-col strong { color: #111; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th, .table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
    .table th { background-color: #f8fafc; color: #555; font-weight: 600; }
    .total-row { font-weight: bold; font-size: 20px; color: #4f46e5; border-top: 2px solid #ddd; }
    .footer { text-align: center; margin-top: 50px; color: #888; font-size: 12px; }
    .print-btn { display: block; margin: 0 auto 20px auto; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
    .print-btn:hover { background: #4338ca; }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt-container { box-shadow: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>

  <div class="receipt-container">
    <div class="header">
      <h1>HOSPIVEXA</h1>
      <p>Hospital Management System</p>
      <p>123 Health Street, Medical City | support@hospivexa.com</p>
    </div>

    <div class="details">
      <div class="details-col">
        <h3>Billed To</h3>
        <p><strong>${patientName || 'Patient'}</strong></p>
        <p>Date: ${billDate}</p>
      </div>
      <div class="details-col">
        <h3>Doctor Details</h3>
        <p><strong>${doctorName || '—'}</strong></p>
        ${doctorSpecialization ? `<p>${doctorSpecialization}</p>` : ''}
        <p>Appointment: ${appointmentDate || '—'} at ${formattedTime}</p>
      </div>
      <div class="details-col">
        <h3>Receipt Details</h3>
        <p>Receipt No: <strong>${receiptNumber || '—'}</strong></p>
        <p>Status: <strong style="color: #059669;">${status}</strong></p>
        <p>Method: <strong>${paymentMethod || '—'}</strong></p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Consultation Fee - ${doctorName || 'Doctor'}</td>
          <td style="text-align: right;">₹${amount ?? 0}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td style="text-align: right;">Total Paid</td>
          <td style="text-align: right;">₹${amount ?? 0}</td>
        </tr>
      </tfoot>
    </table>

    <div class="footer">
      <p>Thank you for choosing Hospivexa.</p>
      <p>This is a computer-generated receipt and does not require a physical signature.</p>
    </div>
  </div>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}