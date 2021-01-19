import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import { genPolicyFiles, openFileDiffFromTextEditor, removeFileSync, showTable, writeFileSyncWithDir } from "../helpers";
import {
    getErrorMissingPolicyMessage,
    getStartCheckProjectMessage,
    INQUIRER_CHOICES,
    inquirerAdditionalFilesConfig,
    inquirerFilesNotMatchConfig,
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
    //TODO: фильтровать policyFiles по паттерну из проекта чтобы убрать багу с перезаписью
    console.log(getStartCheckProjectMessage(policy.policy.policy, projectData.location));

    const coincidenceFiles: Array<string> = [];
    const fundedExtraFiles = [...projectFiles.keys()].filter((p) => !policyFiles.has(p));

    for (let [relPath, content] of policyFiles.entries()) {
        if (projectFiles.has(relPath)) {
            if (projectFiles.get(relPath) !== content) coincidenceFiles.push(relPath);
        } else {
            writeFileSyncWithDir(join(projectDir, relPath), content);
        }
    }

    if (coincidenceFiles.length) {
        for (let [relPath, choice] of await showTable(inquirerFilesNotMatchConfig, coincidenceFiles)) {
            // @ts-ignore
            await executeSelectedAction(choice, join(projectDir, relPath), policyFiles.get(relPath));
        }
    }

    if (fundedExtraFiles.length) {
        for (let [relPath, choice] of await showTable(inquirerAdditionalFilesConfig, fundedExtraFiles)) {
            // @ts-ignore
            await executeSelectedAction(choice, join(projectDir, relPath), policyFiles.get(relPath));
        }
    }
}

async function executeSelectedAction(choice: string, absPath: string, fileContent: string) {
    const {
        replace: { value: replace },
        compare: { value: compare },
        remove: { value: remove },
    } = INQUIRER_CHOICES;
    switch (choice) {
        case replace:
            writeFileSyncWithDir(absPath, fileContent);
            break;
        case compare:
            await showFileDiff(absPath, fileContent);
            break;
        case remove:
            removeFileSync(absPath);
            break;
        default:
    }
}

export async function showFileDiff(path: string, content: string): Promise<void> {
    const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
    writeFileSyncWithDir(expectsFilePath, content);
    await openFileDiffFromTextEditor(expectsFilePath, path);
}

function exceptPolicy(policies: Map<string, PolicyData>, policyName: string, errorMessage: string) {
    const policy = policies.get(policyName);
    if (!policy) {
        console.error(errorMessage);
        process.exit(1);
    }
    return policy;
}
