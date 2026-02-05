module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-solid)",
        "primary-hover": "var(--primary-solid-hover)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(to right, var(--primary-gradient-from), var(--primary-gradient-via), var(--primary-gradient-to))",
      },
    },
  },
  plugins: [],
};
