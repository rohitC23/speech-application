# Speech-evaluation-app

### npm packages to be installed
npm init -y <br />
npm install -d parcel <br />
npm i @parcel/transformer-raw <br />
npm install -D tailwindcss postcss <br />
npx tailwindcss init <br />
npm i react react-dom react-router-dom
npm i react-table

### tailwind.config.js file should looks similar as below:
/** @type {import('tailwindcss').Config} */<br />
module.exports = {<br />
  content: [<br />
    "./src/**/*.{html,js,ts,jsx,tsx}",<br />
  ],<br />
  theme: {<br />
    extend: {<br />
      fontFamily: {<br />
        sans: ['Poppins', 'sans-serif'],<br />
      },<br />
    },<br />
  },<br />
  plugins: [],<br />
}<br />

### update package.json
"scripts": {<br />
	"start": "parcel index.html",<br />
	"build": "parcel build index.html"<br />
	}
### to run the application
npm start
