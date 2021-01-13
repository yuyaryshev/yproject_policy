import { FileMap, PolicyData, ProjectData } from "../types";

type genPolicyFiles = (policyData: PolicyData, projectData: ProjectData) => FileMap;

export const genPolicyFiles: genPolicyFiles = (policyData, projectData) => {
    const generateFiles: FileMap = new Map<string, string>();
    const policyOptions: object = { ...policyData.policy?.defaultOptions, ...projectData.policyConf?.options };

    for (let [relPath, { generate }] of policyData.genFiles.entries()) {
        try {
            generateFiles.set(relPath, generate(projectData.packageJson ? projectData.packageJson : {}, policyOptions));
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
    }

    return generateFiles;
};
