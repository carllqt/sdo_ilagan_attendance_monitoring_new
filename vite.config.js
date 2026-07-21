import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const devServerUrl = env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    const devServerHost = env.VITE_DEV_SERVER_HOST || new URL(devServerUrl).hostname;

    return {
        server: {
            host: "0.0.0.0",
            port: 5173,
            strictPort: true,
            origin: devServerUrl,
            cors: true,
            hmr: {
                host: devServerHost,
            },
        },
        plugins: [
            laravel({
                input: ["resources/js/app.jsx"],
                refresh: true,
            }),
            react(),
        ],
        resolve: {
            alias: {
                "@": path.resolve("resources/js"),
            },
        },
    };
});
