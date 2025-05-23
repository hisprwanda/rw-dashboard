/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx,html}",
		"./public/index.html", // Ensure HTML files are included
	  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			dhisMainBlue: '#2C6693',
  			dhisGrey900: '#212934',
  			dhisDarkBlue: '#1A557F',
  			dhisMainGreen: '#00897b',
  			dhisGrey500: '#A0ADBA',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: '#2C6693',
  			destructive: 'hsl(0, 61%, 57%)',
  			hoverDestructive: 'hsl(0, 80%, 75%)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}