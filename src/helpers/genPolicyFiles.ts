import { FileMap, PolicyData, PolicyOptions, ProjectData } from "../types";

export function genPolicyFiles(policyData: PolicyData, projectData: ProjectData): FileMap {
    const generateFiles: FileMap = new Map<string, string>();
    const policyOptions: PolicyOptions = { ...policyData.policy.options, ...projectData.policyConf?.options };

    for (let [relPath, { generate }] of policyData.genFiles.entries()) {
        generateFiles.set(relPath.replace(/\.gen\.cjs$/, ""), generate(projectData.packageJson ? projectData.packageJson : {}, policyOptions));
    }

    return generateFiles;
}
