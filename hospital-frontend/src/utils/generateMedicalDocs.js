// src/utils/generateMedicalDocs.js

const printDocument = (title, htmlContent) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow pop-ups to download the document.')
    return
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hospivexa - ${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #f8fafc; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px dashed #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4f46e5; margin: 0; font-size: 36px; letter-spacing: 1px; }
    .header p { color: #666; margin: 5px 0 0 0; font-size: 14px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; flex-wrap: wrap; background: #f8fafc; padding: 20px; border-radius: 8px; }
    .details-col { flex: 1; min-width: 180px; }
    .details-col h3 { margin: 0 0 10px 0; font-size: 12px; color: #555; text-transform: uppercase; }
    .details-col p { margin: 4px 0; font-size: 15px; }
    .details-col strong { color: #111; }
    .content-section { margin-bottom: 30px; }
    .content-section h2 { font-size: 18px; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
    .content-box { background: #fafafa; border-left: 4px solid #4f46e5; padding: 15px 20px; border-radius: 0 8px 8px 0; margin-bottom: 15px; }
    .content-box p { margin: 0; line-height: 1.6; font-size: 15px; white-space: pre-wrap; }
    .label { font-weight: bold; color: #334155; display: block; margin-bottom: 4px; font-size: 13px; text-transform: uppercase; }
    
    /* ✅ UPDATED SIGNATURE STYLES */
    .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
    .signature { text-align: center; width: 220px; }
    .signature-name { font-size: 18px; font-weight: bold; color: #111; margin-bottom: 8px; font-family: 'Georgia', serif; }
    .signature-line { border-top: 1px solid #94a3b8; margin-bottom: 6px; }
    .signature-label { font-size: 12px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    
    .print-btn { display: block; margin: 0 auto 20px auto; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; }
    .print-btn:hover { background: #4338ca; }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
      .details { border: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>

  <div class="container">
    <div class="header">
      <h1>HOSPIVEXA</h1>
      <p>Hospital Management System</p>
      <p>123 Health Street, Medical City | support@hospivexa.com</p>
    </div>

    <div class="details">
      <div class="details-col">
        <h3>Patient Details</h3>
        <p><strong>${htmlContent.patientName || 'Patient'}</strong></p>
        <p>Age: ${htmlContent.patientAge ? htmlContent.patientAge + ' yrs' : '—'}</p>
      </div>
      <div class="details-col">
        <h3>Doctor Details</h3>
        <p><strong>${htmlContent.doctorName || 'Doctor'}</strong></p>
        <p>${htmlContent.specialization || ''}</p>
      </div>
      <div class="details-col">
        <h3>Date</h3>
        <p>${htmlContent.date || new Date().toLocaleDateString()}</p>
      </div>
    </div>

    ${htmlContent.bodyHtml}

    <div class="footer">
      <div>
        <p style="font-size: 12px; color: #94a3b8;">Generated on ${new Date().toLocaleString()}</p>
      </div>
      <div class="signature">
        <p class="signature-name">${htmlContent.doctorName || 'Doctor'}</p>
        <div class="signature-line"></div>
        <p class="signature-label">Doctor's Signature</p>
      </div>
    </div>
  </div>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}

export function generateMedicalRecordPDF({ patientName, patientAge, doctorName, specialization, date, healthProblem, treatment, notes }) {
  const bodyHtml = `
    <div class="content-section">
      <h2>Medical Record</h2>
      
      <div class="content-box" style="border-left-color: #ef4444;">
        <span class="label">Health Problem / Diagnosis</span>
        <p style="font-size: 16px; font-weight: 600; color: #b91c1c;">${healthProblem || '—'}</p>
      </div>

      ${treatment ? `
      <div class="content-box">
        <span class="label">Treatment</span>
        <p>${treatment}</p>
      </div>
      ` : ''}

      ${notes ? `
      <div class="content-box">
        <span class="label">Doctor's Notes</span>
        <p>${notes}</p>
      </div>
      ` : ''}
    </div>
  `

  printDocument('Medical Record', {
    patientName,
    patientAge,
    doctorName,
    specialization,
    date: date?.substring(0, 10),
    bodyHtml
  })
}

export function generatePrescriptionPDF({ patientName, patientAge, doctorName, specialization, date, healthProblem, medicine, dosage, duration, instructions }) {
  const bodyHtml = `
    <div class="content-section">
      <h2>Prescription (Rx)</h2>

      ${healthProblem ? `
      <div class="content-box" style="border-left-color: #f59e0b; margin-bottom: 20px;">
        <span class="label">Health Problem / Reason</span>
        <p>${healthProblem}</p>
      </div>
      ` : ''}
      
      <div class="content-box" style="border-left-color: #10b981;">
        <span class="label">Medicine</span>
        <p style="font-size: 18px; font-weight: bold; color: #059669;">${medicine}</p>
      </div>

      <div style="display: flex; gap: 20px;">
        ${dosage ? `
        <div class="content-box" style="flex: 1;">
          <span class="label">Dosage</span>
          <p>${dosage}</p>
        </div>
        ` : ''}

        ${duration ? `
        <div class="content-box" style="flex: 1;">
          <span class="label">Duration</span>
          <p>${duration}</p>
        </div>
        ` : ''}
      </div>

      ${instructions ? `
      <div class="content-box">
        <span class="label">Instructions</span>
        <p>${instructions}</p>
      </div>
      ` : ''}
    </div>
  `

  printDocument('Prescription', {
    patientName,
    patientAge,
    doctorName,
    specialization,
    date: date?.substring(0, 10),
    bodyHtml
  })
}