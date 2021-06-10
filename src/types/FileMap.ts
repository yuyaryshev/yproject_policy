import { PolicyOptions } from "./policy.js";

export type PolicyFileGenerator = {
    generate: (packageJson: object, policyOptions: PolicyOptions, prevContent: string) => string;
    filename?: string | ((packageJson: object, policyOptions: PolicyOptions) => string);
};

export type GenFilesMap = Map<string, PolicyFileGenerator>;
export type FileMap = Map<string, string>;

export interface FileDiff {
    projectContent: string;
    policyContent: string;
}

export type FileDiffMap = Map<string, FileDiff>;

// export interface VirtualFile {
//     getContent:() => string;
// }
//
// function physicalFile(name: string, content: string): VirtualFile {
//     function getContent():string {
//         return content;
//     }
//     return {getContent};
// }
//
// function generatedFile(name: string, content: string): VirtualFile {
//     function getContent():string {
//         return content;
//     }
//     return {getContent};
// }
