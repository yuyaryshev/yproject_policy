import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import { genPolicyFiles, openFileDiffFromTextEditor, removeFileSync, showQuestion, writeFileSyncWithDir } from "../helpers";
import {
    ADDITIONAL_FILES,
    FILES_NOT_MATCH,
    getErrorMissingPolicyMessage,
    getFindDiffFileMessage,
    getFindExtraFileMessage,
    getStartCheckProjectMessage,
    POLICY_EXPECTS_FILE_PREFIX,
} from "../constant";

export async function checkProject(policies: Map<string, PolicyData>, projectData: ProjectData): Promise<void> {
    const {
        location: projectDir,
        files: projectFiles,
        policyConf: { policy: policyName },
    } = projectData;
    const policy = exceptPolicy(policies, policyName, getErrorMissingPolicyMessage(policyName, projectData.location));
    const policyFiles: FileMap = new Map([...genPolicyFiles(policy, projectData), ...policy.files]);
    console.log(getStartCheckProjectMessage(policy.policy.policy, projectData.location));

    for (let [relPath, content] of policyFiles) {
        if (projectFiles.has(relPath)) {
            if (projectFiles.get(relPath) !== content) await showFileDiff(join(projectDir, relPath), content);
        } else writeFileSyncWithDir(join(projectDir, relPath), content);
    }

    for (let path of projectFiles.keys()) {
        if (!policyFiles.has(path)) {
            console.log(getFindExtraFileMessage(path));
            let exit = false;
            while (!exit) {
                const mat = await showQuestion(ADDITIONAL_FILES, path);
                switch (mat) {
                    case "delete":
                        removeFileSync(join(projectDir, path));
                        exit = true;
                        break;
                    case "skip":
                        exit = true;
                        break;
                    default:
                        exit = true;
                }
            }
        }
    }
}

export async function showFileDiff(path: string, content: string): Promise<void> {
    console.log(getFindDiffFileMessage(path));
    const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
    writeFileSyncWithDir(expectsFilePath, content);
    let exit = false;
    while (!exit) {
        const mat = await showQuestion(FILES_NOT_MATCH);
        switch (mat) {
            case "compare":
                await openFileDiffFromTextEditor(expectsFilePath, path);
                break;
            case "replace":
                writeFileSyncWithDir(path, content);
                removeFileSync(expectsFilePath);
                exit = true;
                break;
            case "skip":
                removeFileSync(expectsFilePath);
                exit = true;
                break;
            default:
                exit = true;
        }
    }
}

function exceptPolicy(policies: Map<string, PolicyData>, policyName: string, errorMessage: string) {
    const policy = policies.get(policyName);
    if (!policy) {
        console.error(errorMessage);
        process.exit(1);
    }
    return policy;
}
