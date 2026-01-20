'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [stage, setStage] = useState('egg') // egg, crack, hatch, reveal, complete
  const [progress, setProgress] = useState(0)
  const [currentItem, setCurrentItem] = useState(0)

  const items = [
    { icon: 'fa-key', name: 'Keychains' },
    { icon: 'fa-mask', name: 'Superhero Models' },
    { icon: 'fa-om', name: 'Devotional' },
    { icon: 'fa-dice', name: 'Toys' },
    { icon: 'fa-lightbulb', name: 'Lamps' },
    { icon: 'fa-leaf', name: 'Flower Pots' },
  ]

  useEffect(() => {
    // Egg stage (0-0.5s)
    const eggTimer = setTimeout(() => setStage('crack'), 500)

    // Crack stage (0.5-1s)
    const crackTimer = setTimeout(() => setStage('hatch'), 1000)

    // Hatch stage (1-2s)
    const hatchTimer = setTimeout(() => setStage('reveal'), 2000)

    // Progress bar animation (0-4s)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2.5 // 100 / 40 = 2.5 per 100ms to complete in 4s
      })
    }, 100)

    // Item rotation
    const itemInterval = setInterval(() => {
      setCurrentItem(prev => (prev + 1) % items.length)
    }, 600)

    // Complete and fade out (4s)
    const completeTimer = setTimeout(() => {
      setStage('complete')
    }, 4000)

    return () => {
      clearTimeout(eggTimer)
      clearTimeout(crackTimer)
      clearTimeout(hatchTimer)
      clearTimeout(completeTimer)
      clearInterval(progressInterval)
      clearInterval(itemInterval)
    }
  }, [])

  return (
    <div className={`robohatch-loading-screen ${stage === 'complete' ? 'fade-out' : ''}`}>
      <div className="loading-animation-container">
        {/* Rotating items on top */}
        {stage !== 'egg' && (
          <div className="rotating-items-top">
            {items.map((item, index) => (
              <div
                key={index}
                className={`rotating-item ${currentItem === index ? 'active' : ''}`}
              >
                <i className={`fas ${item.icon}`}></i>
              </div>
            ))}
          </div>
        )}

        {/* Egg and Robot Animation */}
        <div className="egg-container">
          {stage === 'egg' && (
            <div className="egg bounce-in">
              <div className="egg-shell"></div>
            </div>
          )}

          {stage === 'crack' && (
            <div className="egg cracking">
              <div className="egg-shell crack-animation">
                <div className="crack crack-1"></div>
                <div className="crack crack-2"></div>
                <div className="crack crack-3"></div>
              </div>
            </div>
          )}

          {(stage === 'hatch' || stage === 'reveal' || stage === 'complete') && (
            <div className="robot-hatching">
              {/* Bottom egg shell stays */}
              <div className="egg-bottom-shell"></div>
              
              {/* Robot sitting in egg */}
              <div className="hatching-robot pop-out">
                <Image 
                  src="/logo.png" 
                  alt="ROBOHATCH Robot" 
                  width={140} 
                  height={140}
                  priority
                />
              </div>
              
              {/* Upper egg shell thrown away */}
              <div className="egg-piece piece-top-thrown"></div>
            </div>
          )}
        </div>

        {/* Company Name */}
        {(stage === 'reveal' || stage === 'complete') && (
          <h1 className="company-name slide-up">
            ROBOHATCH
          </h1>
        )}

        {/* Loading Bar */}
        {stage !== 'egg' && (
          <div className="loading-bar-container">
            <div className="loading-bar-bg">
              <div 
                className="loading-bar-fill" 
                style={{ width: `${progress}%` }}
              ></div>
              <span className="loading-percentage">{Math.floor(progress)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
