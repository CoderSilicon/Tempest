import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nord: {
          "0": "#2E3440",
          "1": "#3B4252",
          "2": "#434C5E",
          "3": "#4C566A",
          "4": "#D8DEE9",
          "5": "#E5E9F0",
          "6": "#ECEFF4",
          "7": "#8FBCBB",
          "8": "#88C0D0",
          "9": "#81A1C1",
          "10": "#5E81AC",
          "11": "#BF616A",
          "12": "#D08770",
          "13": "#EBCB8B",
          "14": "#A3BE8C",
          "15": "#B48EAD",
        },
        polar: {
          night: {
            DEFAULT: "#2E3440",
            light: "#3B4252",
            lighter: "#434C5E",
            lightest: "#4C566A",
          },
        },
        snow: {
          storm: {
            DEFAULT: "#D8DEE9",
            light: "#E5E9F0",
            lighter: "#ECEFF4",
          },
        },
        frost: {
          DEFAULT: "#8FBCBB",
          light: "#88C0D0",
          lighter: "#81A1C1",
          lightest: "#5E81AC",
        },
        aurora: {
          red: "#BF616A",
          orange: "#D08770",
          yellow: "#EBCB8B",
          green: "#A3BE8C",
          purple: "#B48EAD",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
