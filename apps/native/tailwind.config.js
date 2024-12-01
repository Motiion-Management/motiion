module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D87E1",
        accent: "#FF4081",
        background: "#FFFFFF",
        text: "#000000"
      },
      fontFamily: {
        'sans': ['Inter'],
        'montserrat': ['Montserrat'],
      }
    },
  },
  plugins: [],
}
