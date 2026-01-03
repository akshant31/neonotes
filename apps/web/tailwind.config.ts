import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            colors: {
                primary: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                    950: "#1e1b4b",
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: "none",
                        color: "inherit",
                        a: {
                            color: "#6366f1",
                            "&:hover": {
                                color: "#4f46e5",
                            },
                        },
                        code: {
                            color: "#e5e7eb",
                            backgroundColor: "#1f2937",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontWeight: "400",
                        },
                        "code::before": {
                            content: "none",
                        },
                        "code::after": {
                            content: "none",
                        },
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
