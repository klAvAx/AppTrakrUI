module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        minuteSpin: 'minuteSpin 4s linear infinite',
        hourSpin: 'hourSpin 240s linear infinite'
      },
      borderWidth: {
        '1': '1px'
      },
      colors: {
        'slate-250': '#D7DFE9',
        'slate-350': '#B0BCCD',
        'slate-450': '#7C8CA2',
        'slate-550': '#56657A',
        'gray-250': '#DBDEE3',
        'gray-350': '#B7BCC5',
        'gray-450': '#848B98',
        'gray-550': '#5B6472'
      },
      keyframes: {
        minuteSpin: {
          '0%': { transform: 'rotate(90deg)' },
          '100%': { transform: 'rotate(450deg)' }
        },
        hourSpin: {
          '0%': { transform: 'rotate(225deg)' },
          '100%': { transform: 'rotate(585deg)' }
        }
      },
      padding: {
        '22': '5.5rem'
      },
      transitionDuration: {
        '250': '250ms'
      },
      transitionProperty: {
        'header': 'top, margin, left, right, transform',
        'tooltip': 'top, left, width, height, opacity, transform',
        'colorWidth': 'color, background-color, border-color, text-decoration-color, fill, stroke, width',
        'colorHeight': 'color, background-color, border-color, text-decoration-color, fill, stroke, height',
        'colorWidthTransform': 'color, background-color, border-color, text-decoration-color, fill, stroke, width, transform',
        'colorHeightTransform': 'color, background-color, border-color, text-decoration-color, fill, stroke, height, transform'
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(1, -0.5, 0, 1.5)',
        'bounce-out': 'cubic-bezier(1, 0.5, 0, 1.5)',
      },
      width: {
        '21': '5.25rem',
        '27': '6.75rem'
      },
      zIndex: {
        '999': '999',
        '1000': '1000',
        '1250': '1250',
        '1499': '1499',
        '1500': '1500',
        '9999': '9999'
      }
    },
  },
  plugins: [],
}
