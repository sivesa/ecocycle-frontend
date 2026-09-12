import createViteConfig from './vite.base.config';

export default createViteConfig({
  htmlInput: 'index.collector.html',
  outDir: 'dist/collector',
  port: 5174,
});