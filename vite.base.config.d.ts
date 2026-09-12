export interface TargetConfig {
    /** Root HTML entry file for this build target (relative to project root). */
    htmlInput: string;
    /** Output directory for the built static web bundle. */
    outDir: string;
    /** Dev server port for this target. */
    port: number;
}
export default function createViteConfig({ htmlInput, outDir, port }: TargetConfig): import("vite").UserConfig;
