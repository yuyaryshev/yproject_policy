import { FileMap, PolicyData, ProjectData } from "../types";
import { join } from "path";
import { genPolicyFiles, writeFileSyncWithDir } from "../helpers";

type checkPolicy = (policyData: PolicyData, projectData: ProjectData) => void;

export const checkPolicy: checkPolicy = (policyData, projectData) => {
    const { location: projectDir, files: projectFiles } = projectData;
    const generatedPolicyFiles: FileMap = genPolicyFiles(policyData, projectData);

    for (let [relPath, genContent] of generatedPolicyFiles) {
        try {
            if (projectFiles.has(relPath)) {
                if (projectFiles.get(relPath) !== genContent) console.log("SHOW DIFF");
                else console.log("FILES IDENT");
            } else writeFileSyncWithDir(join(projectDir, relPath), genContent);
        } catch (error) {
            console.error(error.message);
            process.exit(5);
        }
    }

    //TODO: check extra files
};
