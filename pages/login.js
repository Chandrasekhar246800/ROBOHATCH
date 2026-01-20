'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'

export default function Login() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' })
  const [loginError, setLoginError] = useState('')

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' }
    
    let score = 0
    
    // Length check
    if (pass.length >= 8) score += 20
    if (pass.length >= 12) score += 10
    if (pass.length >= 16) score += 10
    
    // Character variety checks
    if (/[a-z]/.test(pass)) score += 15
    if (/[A-Z]/.test(pass)) score += 15
    if (/[0-9]/.test(pass)) score += 15
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 15
    
    // Additional complexity
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 5
    if (/[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 5
    
    let label = ''
    let color = ''
    
    if (score < 40) {
      label = 'Weak'
      color = '#d32f2f'
    } else if (score < 70) {
      label = 'Medium'
      color = '#ff9800'
    } else {
      label = 'Strong'
      color = '#4caf50'
    }
    
    return { score, label, color }
  }

  const validatePassword = (pass) => {
    const errors = []
    if (pass.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(pass)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(pass)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(pass)) errors.push('One number')
    if (!/[!@#$%^&*]/.test(pass)) errors.push('One special character (!@#$%^&*)')
    setPasswordErrors(errors)
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    if (isSignUp) {
      validatePassword(newPassword)
      setPasswordStrength(calculatePasswordStrength(newPassword))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoginError('')

    if (!isSignUp) {
      // Sign In - Check for admin credentials
      if (email === 'nenudevudini@gmail.com' && password === '1122334455@Rh') {
        // Redirect to admin page
        router.push('/admin')
      } else {
        setLoginError('Invalid email or password')
      }
    } else {
      // Sign Up logic (if needed)
      console.log('Sign up attempted')
    }
  }

  return (
    <>
      <Navbar hideLogin={true} hideMenu={true} hideCart={true} />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
          <div className="login-header">
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Sign up to get started' : 'Sign in to your account'}</p>
          </div>

          <div className="tab-buttons">
            <button 
              className={`tab-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {loginError && (
              <div className="login-error">
                <i className="fas fa-exclamation-circle"></i>
                {loginError}
              </div>
            )}
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button 
                  type="button" 
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {isSignUp && password && (
                <div className="password-strength">
                  <div className="strength-bar-container">
                    <div 
                      className="strength-bar"
                      style={{ 
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {isSignUp && passwordErrors.length > 0 && (
                <div className="password-constraints">
                  <p className="constraints-title">Password must contain:</p>
                  <ul>
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="error">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password" 
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="eye-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`password-match ${password === confirmPassword ? 'match' : 'no-match'}`}>
                    <i className={`fas ${password === confirmPassword ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    <span>{password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="forgot-password">Forgot Password?</Link>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="social-login">
            <div className="divider">
              <span>Or continue with</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn google">
                <i className="fab fa-google"></i>
                Google
              </button>
              <button className="social-btn facebook">
                <i className="fab fa-facebook-f"></i>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
