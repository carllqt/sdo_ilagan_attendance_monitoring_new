import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const serverUrl = new URL(
        env.VITE_DEV_SERVER_URL || "http://localhost:5173",
    );

    return {
        server: {
            host: "0.0.0.0",
            port: Number(serverUrl.port) || 5173,
            strictPort: true,
            origin: serverUrl.origin,
            cors: true,
            hmr: {
                host: serverUrl.hostname,
            },
        },

        plugins: [
            laravel({
                input: "resources/js/app.jsx",
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
