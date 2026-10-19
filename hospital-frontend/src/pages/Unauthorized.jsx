import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="text-center mt-5">
      <h1 className="display-4">🚫 403</h1>
      <h3>Access Denied</h3>
      <p className="text-muted">You do not have permission to view this page.</p>
      <Link to="/login" className="btn btn-primary mt-3">Back to Login</Link>
    </div>
  )
}