/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'white': '#ffffff',
        'soft-peach': '#F2935C',
        'primary-orange': '#F25C05',
        'hover-orange': '#F27405',
        'dark-brown': '#260A03',
        'muted-brown': '#8C3503',
        'light-gray': '#f8f9fa',
        'border-color': '#e9ecef',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.3)', opacity: '0.9' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        rotateArc: {
          '0%': { transform: 'rotateZ(0deg) rotateY(75deg) rotateX(15deg)' },
          '100%': { transform: 'rotateZ(360deg) rotateY(75deg) rotateX(15deg)' },
        },
        titleGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(242, 92, 5, 0.6))' },
        },
        letterFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotateY(0deg)' },
          '25%': { transform: 'translateY(-10px) rotateY(5deg)' },
          '50%': { transform: 'translateY(0px) rotateY(0deg)' },
          '75%': { transform: 'translateY(-5px) rotateY(-5deg)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(400px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          'from': { transform: 'translateX(0)', opacity: '1' },
          'to': { transform: 'translateX(400px)', opacity: '0' },
        },
        slideInUp: {
          'from': { transform: 'translateY(100px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0) translateY(-100px)', opacity: '0' },
          '50%': { transform: 'scale(1.1) translateY(10px)' },
          '70%': { transform: 'scale(0.95) translateY(-5px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        crackGrow: {
          'from': { height: '0' },
          'to': { height: '60px' },
        },
        shellStay: {
          '0%': { opacity: '0', transform: 'translateX(-50%) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) scale(1)' },
        },
        pieceTopThrown: {
          '0%': { transform: 'translateX(-50%) translateY(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translateX(-100px) translateY(-50px) rotate(-45deg)', opacity: '0.8' },
          '100%': { transform: 'translateX(-180px) translateY(-120px) rotate(-90deg)', opacity: '0' },
        },
        popOut: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '70%': { transform: 'scale(1.2) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        slideUpFade: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        itemPulse: {
          '0%, 100%': { transform: 'scale(1) rotate(360deg)' },
          '50%': { transform: 'scale(1.2) rotate(360deg)' },
        },
        modalSlideIn: {
          'from': { transform: 'translateY(-50px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-custom': 'pulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease',
        'rotate-arc': 'rotateArc 3s linear infinite',
        'title-glow': 'titleGlow 2s ease-in-out infinite',
        'letter-float': 'letterFloat 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'fade-in-up': 'fadeInUp 0.5s ease',
        'slide-down': 'slideDown 0.3s ease',
        'slide-in-right': 'slideInRight 0.3s ease',
        'slide-out-right': 'slideOutRight 0.3s ease',
        'slide-in-up': 'slideInUp 0.3s ease',
        'bounce-custom': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'shake': 'shake 0.5s ease-in-out infinite',
        'crack-grow': 'crackGrow 0.5s ease-out forwards',
        'shell-stay': 'shellStay 0.3s ease-out forwards',
        'piece-top-thrown': 'pieceTopThrown 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'pop-out': 'popOut 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'slide-up-fade': 'slideUpFade 0.8s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'item-pulse': 'itemPulse 0.6s ease',
        'modal-slide-in': 'modalSlideIn 0.3s ease',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(10px)',
      },
    },
  },
  plugins: [],
}
