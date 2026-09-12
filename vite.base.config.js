import { resolve, basename } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
/**
 * Vite's dev html-fallback middleware maps the root path to a literal
 * `index.html` at the project root. Our targets use distinct, entry-named
 * files (`index.household.html` / `index.collector.html`), so `/` would 404
 * in dev. This middleware rewrites `/` (and `/index.html`) to the real entry
 * file for the active target *before* the html-fallback middleware runs —
 * single source of truth, works in dev without a duplicated root index.html.
 */
function devEntryRewrite(htmlInput) {
    var entry = basename(htmlInput);
    return {
        name: 'ecocycle:target-html',
        apply: 'serve',
        configureServer: function (server) {
            server.middlewares.use(function (req, _res, next) {
                var _a;
                var pathname = ((_a = req.url) !== null && _a !== void 0 ? _a : '').split('?')[0];
                if (pathname === '/' || pathname === '/index.html') {
                    req.url = "/".concat(entry);
                }
                next();
            });
        },
    };
}
export default function createViteConfig(_a) {
    var htmlInput = _a.htmlInput, outDir = _a.outDir, port = _a.port;
    return defineConfig({
        plugins: [react(), devEntryRewrite(htmlInput)],
        build: {
            outDir: outDir,
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    index: resolve(__dirname, htmlInput),
                },
            },
        },
        server: {
            port: port,
        },
    });
}
