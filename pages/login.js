'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)

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

          <form className="login-form">
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
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  placeholder="Confirm your password"
                  required
                />
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
