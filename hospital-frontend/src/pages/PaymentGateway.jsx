import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { payTransaction } from '../api/transactionApi.js'
import { generateBill } from '../utils/generateBill.js'

export default function PaymentGateway() {
  const location = useLocation()
  const navigate = useNavigate()

  const { transactionId, amount, doctorName, patientName, date, time, redirectTo } = location.state || {}

  const [selectedMethod, setSelectedMethod] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const getTargetDashboard = () => {
    if (redirectTo) return redirectTo
    const userStr = localStorage.getItem('user') || localStorage.getItem('role')
    let role = 'PATIENT'
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        role = parsed.role || parsed
      } catch (e) {
        role = userStr
      }
    }
    if (role === 'RECEPTIONIST') return '/receptionist'
    if (role === 'DOCTOR') return '/doctor'
    if (role === 'ADMIN') return '/admin'
    return '/patient'
  }

  const dashboardRoute = getTargetDashboard()

  useEffect(() => {
    if (!transactionId) {
      navigate(dashboardRoute)
    }
  }, [transactionId, navigate, dashboardRoute])

  const handlePay = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    setError('')
    setIsPaying(true)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Call backend to mark as PAID
      await payTransaction(transactionId, selectedMethod)
      
      setIsSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setIsPaying(false)
    }
  }

  const handleDownloadBill = () => {
    generateBill({
      receiptNumber: `TXN-${transactionId}`,
      patientName,
      doctorName,
      appointmentDate: date,
      appointmentTime: time,
      amount,
      paymentMethod: selectedMethod,
      status: 'PAID',
    })
  }

  // ✅ ZERO ALERTS: Just navigate smoothly
  const handleFinish = () => {
    navigate(dashboardRoute)
  }

  if (isSuccess) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container" style={{ maxWidth: '600px', marginTop: '50px' }}>
          <div className="content-card text-center p-5 shadow">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="mb-3">Payment Successful!</h2>
            <p className="text-muted mb-4">Your appointment with {doctorName} is confirmed.</p>
            
            <div className="premium-alert success mb-4 text-start">
              <p className="mb-1"><strong>Amount Paid:</strong> ₹{amount}</p>
              <p className="mb-1"><strong>Method:</strong> {selectedMethod}</p>
              <p className="mb-0"><strong>Date:</strong> {date} at {time}</p>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <button className="btn btn-outline-primary" onClick={handleDownloadBill}>
                <i className="bi bi-download me-2"></i>Download Bill
              </button>
              <button className="btn btn-gradient-primary" onClick={handleFinish}>
                Go to Dashboard <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container" style={{ maxWidth: '850px', marginTop: '40px' }}>
        <div className="row g-4">
          
          {/* Left Side: Order Summary */}
          <div className="col-md-5">
            <div className="content-card p-4 shadow h-100" style={{ borderTop: '4px solid var(--hms-violet)' }}>
              <h4 className="mb-4">Booking Summary</h4>
              
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Patient</span>
                <strong>{patientName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Doctor</span>
                <strong>{doctorName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Date</span>
                <strong>{date}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Time</span>
                <strong>{time}</strong>
              </div>
              
              <div className="d-flex justify-content-between mt-4 align-items-center">
                <span className="h5 mb-0">Total Fee</span>
                <span className="h3 mb-0 fw-bold" style={{ color: 'var(--hms-violet)' }}>₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Payment Options */}
          <div className="col-md-7">
            <div className="content-card p-4 shadow">
              <h4 className="mb-4">Select Payment Method</h4>
              
              {error && <div className="premium-alert danger mb-3">{error}</div>}

              <div className="d-flex flex-column gap-3">
                {/* PhonePe */}
                <div 
                  className={`real-payment-card ${selectedMethod === 'PhonePe' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('PhonePe')}
                >
                  <div className="d-flex align-items-center">
                    <div className="payment-icon-box phonepe-bg">
                      <i className="bi bi-phone"></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 fw-bold">PhonePe / UPI</h6>
                      <small className="text-muted">Pay using any UPI application</small>
                    </div>
                  </div>
                  <div className={`payment-radio ${selectedMethod === 'PhonePe' ? 'checked' : ''}`}></div>
                </div>

                {/* GPay */}
                <div 
                  className={`real-payment-card ${selectedMethod === 'GPay' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('GPay')}
                >
                  <div className="d-flex align-items-center">
                    <div className="payment-icon-box gpay-bg">
                      <span className="gpay-logo">G</span>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 fw-bold">Google Pay</h6>
                      <small className="text-muted">Pay securely using GPay</small>
                    </div>
                  </div>
                  <div className={`payment-radio ${selectedMethod === 'GPay' ? 'checked' : ''}`}></div>
                </div>

                {/* Card */}
                <div 
                  className={`real-payment-card ${selectedMethod === 'Card' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('Card')}
                >
                  <div className="d-flex align-items-center">
                    <div className="payment-icon-box card-bg">
                      <i className="bi bi-credit-card-2-front-fill"></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0 fw-bold">Debit / Credit Card</h6>
                      <small className="text-muted">Visa, Mastercard, RuPay, Maestro</small>
                    </div>
                  </div>
                  <div className={`payment-radio ${selectedMethod === 'Card' ? 'checked' : ''}`}></div>
                </div>
              </div>

              <button 
                className="btn-gradient-primary w-100 mt-4 py-3 fs-5" 
                onClick={handlePay}
                disabled={isPaying}
              >
                {isPaying ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                ) : (
                  <>Pay ₹{amount} Securely</>
                )}
              </button>
              
              <div className="text-center mt-3">
                <small className="text-muted"><i className="bi bi-shield-lock-fill me-1 text-success"></i> 100% Secure & Encrypted</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}