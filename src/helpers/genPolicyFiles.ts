import { FileMap, PolicyData, PolicyOptions, ProjectData } from "../types";

export function genPolicyFiles(policyData: PolicyData, projectData: ProjectData): FileMap {
    const generateFiles = new Map();
    const policyOptions: PolicyOptions | undefined = projectData.policyConf?.options;

    for (let [relPath, { generate }] of policyData.genFiles.entries()) {
        generateFiles.set(relPath.replace(/\.gen\.cjs$/, ""), generate(projectData.packageJson ?? {}, policyOptions ?? {}));
    }

    return generateFiles;
}
