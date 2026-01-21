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
    <div className={`fixed inset-0 bg-gradient-to-br from-primary-orange via-hover-orange to-dark-brown flex items-center justify-center z-[9999] ${stage === 'complete' ? 'opacity-0 transition-opacity duration-500' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center">
        {/* Rotating items on top */}
        {stage !== 'egg' && (
          <div className="absolute -top-24 flex gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl transition-all duration-300 ${currentItem === index ? 'scale-125 bg-white/40' : 'scale-100'}`}
              >
                <i className={`fas ${item.icon}`}></i>
              </div>
            ))}
          </div>
        )}

        {/* Egg and Robot Animation */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {stage === 'egg' && (
            <div className="animate-[bounce_0.5s_ease-out]">
              <div className="w-32 h-40 bg-white rounded-[50%] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"></div>
            </div>
          )}

          {stage === 'crack' && (
            <div className="animate-[shake_0.5s_ease-in-out]">
              <div className="relative w-32 h-40 bg-white rounded-[50%] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="absolute top-1/4 left-1/2 w-1 h-12 bg-dark-brown/40 rotate-45"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-10 bg-dark-brown/40 -rotate-12"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-8 bg-dark-brown/40 rotate-12"></div>
              </div>
            </div>
          )}

          {(stage === 'hatch' || stage === 'reveal' || stage === 'complete') && (
            <div className="relative">
              {/* Bottom egg shell stays */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-white rounded-b-[50%] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"></div>
              
              {/* Robot sitting in egg */}
              <div className="relative z-10 animate-[popOut_0.6s_ease-out]">
                <Image 
                  src="/logo.png" 
                  alt="ROBOHATCH Robot" 
                  width={140} 
                  height={140}
                  priority
                />
              </div>
              
              {/* Upper egg shell thrown away */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-28 h-20 bg-white rounded-t-[50%] animate-[throwAway_0.5s_ease-out] opacity-0"></div>
            </div>
          )}
        </div>

        {/* Company Name */}
        {(stage === 'reveal' || stage === 'complete') && (
          <h1 className="text-5xl font-bold text-white mt-8 tracking-wider animate-[slideUp_0.5s_ease-out]">
            ROBOHATCH
          </h1>
        )}

        {/* Loading Bar */}
        {stage !== 'egg' && (
          <div className="mt-8 w-80">
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
              <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold">{Math.floor(progress)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
