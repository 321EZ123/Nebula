import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { baremuxPath } from "@mercuryworkshop/bare-mux";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import playformCompress from "@playform/compress";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import icon from "astro-icon";
import { defineConfig, envField } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { version } from "./package.json";
import { parsedDoc } from "./server/config.js";
export default defineConfig({
    experimental: {
        env: {
            schema: {
                VERSION: envField.string({
                    context: "client",
                    access: "public",
                    optional: true,
                    default: version
                }),
                MARKETPLACE_ENABLED: envField.boolean({
                    context: "client",
                    access: "public",
                    optional: true,
                    default: parsedDoc.marketplace.enabled
                })
            }
        }
    },
    integrations: [
        tailwind(),
        icon(),
        svelte(),
        playformCompress({
            CSS: false,
            HTML: true,
            Image: true,
            JavaScript: true,
            SVG: true
        })
    ],
    vite: {
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: `${uvPath}/**/*`.replace(/\\/g, "/"),
                        dest: "uv",
                        overwrite: false
                    },
                    {
                        src: `${epoxyPath}/**/*`.replace(/\\/g, "/"),
                        dest: "epoxy",
                        overwrite: false
                    },
                    {
                        src: `${libcurlPath}/**/*`.replace(/\\/g, "/"),
                        dest: "libcurl",
                        overwrite: false
                    },
                    {
                        src: `${baremuxPath}/**/*`.replace(/\\/g, "/"),
                        dest: "baremux",
                        overwrite: false
                    }
                ]
            })
        ],
        server: {
            proxy: {
                "/api/catalog-assets": {
                    target: "http://localhost:8080/api/catalog-assets",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/catalog-assets/, "")
                },
                "/api/packages": {
                    target: "http://localhost:8080/api/packages",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/packages/, "")
                },
                "/packages": {
                    target: "http://localhost:8080",
                    changeOrigin: true
                },
                "/wisp/": {
                    target: "ws://localhost:8080/wisp/",
                    changeOrigin: true,
                    ws: true,
                    rewrite: (path) => path.replace(/^\/wisp\//, "")
                },
                "/styles": {
                    target: "http://localhost:8080",
                    changeOrigin: true
                }
            }
        }
    },
    output: "server",
    adapter: node({
        mode: "middleware"
    })
});
