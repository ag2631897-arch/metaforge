/**
 * MetaForge GitHub Export Generator
 *
 * Takes a MetaForge config and generates a standalone Next.js project
 * that can be pushed to GitHub. Produces all files needed to run
 * independently without the MetaForge runtime.
 */
interface ExportConfig {
    app: {
        name: string;
        description?: string;
        version?: string;
    };
    entities: any[];
    pages: any[];
    auth?: any;
    theme?: any;
    navigation?: any;
}
interface GeneratedFile {
    path: string;
    content: string;
}
export declare function generateStandaloneProject(config: ExportConfig): GeneratedFile[];
export {};
//# sourceMappingURL=github-export.d.ts.map