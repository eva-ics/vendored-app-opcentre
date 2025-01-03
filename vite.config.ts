import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "",
    plugins: [react()],
    css: {
        devSourcemap: true,
    },
    resolve: {
        alias: {
            "@sass": "/src/sass",
        },
    },
});
