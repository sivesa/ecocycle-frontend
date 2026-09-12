import { resolve, basename } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

export interface TargetConfig {
  /** Root HTML entry file for this build target (relative to project root). */
  htmlInput: string;
  /** Output directory for the built static web bundle. */
  outDir: string;
  /** Dev server port for this target. */
  port: number;
}

/**
 * Vite's dev html-fallback middleware maps the root path to a literal
 * `index.html` at the project root. Our targets use distinct, entry-named
 * files (`index.household.html` / `index.collector.html`), so `/` would 404
 * in dev. This middleware rewrites `/` (and `/index.html`) to the real entry
 * file for the active target *before* the html-fallback middleware runs —
 * single source of truth, works in dev without a duplicated root index.html.
 */
function devEntryRewrite(htmlInput: string): Plugin {
  const entry = basename(htmlInput);
  return {
    name: 'ecocycle:target-html',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(
        (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
          const pathname = (req.url ?? '').split('?')[0];
          if (pathname === '/' || pathname === '/index.html') {
            req.url = `/${entry}`;
          }
          next();
        },
      );
    },
  };
}

export default function createViteConfig({ htmlInput, outDir, port }: TargetConfig) {
  return defineConfig({
    plugins: [react(), devEntryRewrite(htmlInput)],
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, htmlInput),
        },
      },
    },
    server: {
      port,
    },
  });
}
