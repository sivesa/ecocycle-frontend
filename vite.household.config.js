import createViteConfig from './vite.base.config';
export default createViteConfig({
    htmlInput: 'index.household.html',
    outDir: 'dist/household',
    port: 5173,
});
