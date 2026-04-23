/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream:        "#FFFFFF",
        "cream-2":    "#FDF6E8",
        "cream-3":    "#FAF6EC",
        ink:          "#1C1C1C",
        "ink-2":      "#3A3A3A",
        "ink-3":      "#5A5A5A",
        muted:        "#7A7A7A",
        line:         "#E8E8E8",
        "line-2":     "#F0F0F0",
        "accent-warm":"#B87A2E",
        "pop-peach":  "#F8DFB0",
        "pop-peach-warm": "#FBE8C0",
        "pop-lavender":"#F0E5FB",
        success:      "#4F7F4B",
        danger:       "#C14E3C",
        warning:      "#D4923A",
      },
      borderRadius: {
        card:   "14px",
        hero:   "24px",
        phone:  "42px",
        pill:   "100px",
      },
    },
  },
  plugins: [],
};
