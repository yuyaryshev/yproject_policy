import { PolicyData, ProjectData } from "../types";
import { readFileSync } from "fs-extra";
import { basename, dirname, join } from "path";
import {
    filterExcludeFilesFromPolicy,
    genPolicyFiles,
    openFileDiffFromTextEditor,
    removeFileSync,
    showTable,
    writeFileSyncWithDir,
} from "../helpers";
import {
    getErrorMissingPolicyMessage,
    getFinishCheckProjectMessage,
    getStartCheckProjectMessage,
    INQUIRER_CHOICES,
    inquirerAdditionalFilesConfig,
    inquirerFilesNotMatchConfig,
    POLICY_EXPECTS_FILE_PREFIX,
} from "../constant";
import { FileMap } from "../types/FileMap";

export async function checkProject(policies: Map<string, PolicyData>, projectData: ProjectData): Promise<void> {
    const {
        location: projectDir,
        files: projectFiles,
        policyConf: { policy: policyName, options: projectOptions },
    } = projectData;
    const policy = exceptPolicy(policies, policyName, getErrorMissingPolicyMessage(policyName, projectData.location));

    const policyFiles: FileMap = filterExcludeFilesFromPolicy(
        new Map([...policy.files, ...genPolicyFiles(policy, projectData)]),
        projectOptions?.exclude ?? [],
    );
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
            await executeSelectedAction(
                choice,
                join(projectDir, relPath),
                policyFiles.get(relPath),
                policy.policyAbsPath,
                !policy.files.has(relPath),
            );
        }
    }

    if (fundedExtraFiles.length) {
        for (let [relPath, choice] of await showTable(inquirerAdditionalFilesConfig, fundedExtraFiles)) {
            // @ts-ignore
            await executeSelectedAction(
                choice,
                join(projectDir, relPath),
                policyFiles.get(relPath),
                policy.policyAbsPath,
                !policy.files.has(relPath),
            );
        }
    }
    console.log(getFinishCheckProjectMessage());
}

async function executeSelectedAction(choice: string, absPath: string, fileContent: string, policyAbsPath: string, generated: boolean) {
    console.log(`CODE00000000 executeSelectedAction ${choice} ${absPath} ${policyAbsPath}`);
    const {
        replace: { value: replace },
        compare: { value: compare },
        remove: { value: remove },
        to_policy: { value: to_policy },
    } = INQUIRER_CHOICES;
    switch (choice) {
        case replace:
            writeFileSyncWithDir(absPath, fileContent);
            break;
        case compare:
            if (!generated) await showFileDiffFile(absPath, policyAbsPath);
            else await showFileDiffGen(absPath, fileContent);
            break;
        case remove:
            removeFileSync(absPath);
            break;
        case to_policy:
            writeFileSyncWithDir(join(policyAbsPath, basename(absPath)), readFileSync(absPath, "utf-8"));
            break;
        default:
    }
}

export async function showFileDiffFile(path: string, policyAbsPath: string): Promise<void> {
    await openFileDiffFromTextEditor(join(policyAbsPath, basename(path)), path);
}

export async function showFileDiffGen(path: string, content: string): Promise<void> {
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
