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
				primary: '#3f50b5',
				pdark: '#002884',
				plight: '#757ce8',
				ptext: '#fff',
				secondary: '#f44336',
				sdark: '#ba000d',
				slight: '#ff7961',
				stext: '#000',
				blackA6: '#0000008A',
				dhisMainBlue: '#2C6693',
				dhisGrey900: '#212934',
				dhisDarkBlue: '#1A557F',
				dhisMainGreen: '#00897b',
				dhisGrey500: '#A0ADBA',
				success: "#219653",
				danger: "#D34053",
				warning: "#FFA70B",
				border: "hsl(var(--border))",
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				  },
				  muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				  },
				  accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				  },
				  popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				  },
				  card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				  },

			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}