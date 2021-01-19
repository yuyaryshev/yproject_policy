import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import {
    genPolicyFiles,
    openFileDiffFromTextEditor,
    removeFileSync,
    writeFileSyncWithDir,
    showTable,
} from "../helpers";
import {
    ADDITIONAL_FILES,
    FILES_NOT_MATCH,
    getErrorMissingPolicyMessage,
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

    let coincidence: Array<string> = [];
    for (let [relPath, content] of policyFiles) {
        if (projectFiles.has(relPath)) {
            if (projectFiles.get(relPath) !== content) {
                coincidence.push(relPath);
            }
        } else writeFileSyncWithDir(join(projectDir, relPath), content);
    }
    const answersNotMatch = await showTable(coincidence, ["compare", "replace", "skip"], FILES_NOT_MATCH);
    await handleNotMatch(answersNotMatch, coincidence, policyFiles);

    const pathList = [...projectFiles.keys()].filter(p => !policyFiles.has(p));
    const answersToAdditionalFiles = await showTable(pathList, ["delete", "skip"], ADDITIONAL_FILES);
    await handleAddFiles(answersToAdditionalFiles, pathList);
}


async function handleAddFiles(answers: Array<string>, pathList: Array<string>) {
    for (let i = 0; answers[i] != undefined; i++) {
        if (answers[i] === "delete") {
            removeFileSync(pathList[i]);
        }
    }
}

async function handleNotMatch(answers: Array<string>, pathList: Array<string>, policyFiles: FileMap) {
    for (let i = 0; answers[i] != undefined; i++) {
        if (answers[i] === "compare") {
            const expectsFilePath = join(dirname(pathList[i]), `${POLICY_EXPECTS_FILE_PREFIX}${basename(pathList[i])}`);
            await openFileDiffFromTextEditor(expectsFilePath, pathList[i]);
        } else if (answers[i] === "replace") {
            writeFileSyncWithDir(pathList[i], policyFiles.get(pathList[i]) || "Content not found");
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
