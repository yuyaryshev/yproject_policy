import { PolicyData, ProjectData } from "../types";
import { readFileSync } from "fs-extra";
import { basename, dirname, join } from "path";
import {
    filterExcludeFilesFromPolicy,
    genPolicyFiles,
    openFileDiffFromTextEditor,
    readProject,
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
    PROJECT_POLICY_PREV_CONTENT_FILENAME,
} from "../constant";
import { FileDiffMap, FileMap } from "../types/FileMap";
import { unlinkSync } from "fs";

export function compareWithPolicy(policies: Map<string, PolicyData>, projectData: ProjectData) {
    const {
        projectDir,
        projectFiles,
        policyConf: { policy: policyName, options: projectOptions },
    } = projectData;
    const policy = exceptPolicy(policies, policyName, getErrorMissingPolicyMessage(policyName, projectData.projectDir));
    const policyFiles: FileMap = filterExcludeFilesFromPolicy(
        new Map([...policy.files, ...genPolicyFiles(policy, projectData)]),
        projectOptions?.exclude ?? [],
    );

    const projectExtraFiles: FileMap = new Map();
    for (const [fileName, projectContent] of projectFiles) if (!policyFiles.has(fileName)) projectExtraFiles.set(fileName, projectContent);

    const matchingFiles: FileMap = new Map();
    const differentFiles: FileDiffMap = new Map();
    const policyExtraFiles: FileMap = new Map();
    for (const [fileName, policyContent] of policyFiles) {
        const projectContent = projectFiles.get(fileName) || "";
        if (!projectFiles.has(fileName)) policyExtraFiles.set(fileName, policyContent);
        else {
            if (policyContent === projectContent) matchingFiles.set(fileName, policyContent);
            else differentFiles.set(fileName, { projectContent, policyContent });
        }
    }
    return { policy, policyFiles, matchingFiles, differentFiles, projectExtraFiles, policyExtraFiles };
}

export async function checkProject(policies: Map<string, PolicyData>, projectData: ProjectData): Promise<void> {
    const { projectDir } = projectData;
    {
        const { policy, policyFiles, differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles } = compareWithPolicy(policies, projectData);

        // Add policy files
        for (const [fileName, policyContent] of policyExtraFiles) {
            writeFileSyncWithDir(join(projectDir, fileName), policyContent);
            matchingFiles.set(fileName, policyContent);
            policyExtraFiles.delete(fileName);
        }

        // Overwrite unchagned files
        for (const [fileName, d] of differentFiles)
            if (projectData.prevPolicyFiles.has(fileName)) {
                writeFileSyncWithDir(join(projectDir, fileName), d.policyContent);
                matchingFiles.set(fileName, d.policyContent);
                differentFiles.delete(fileName);
            }

        // Delete old policy files
        for (const [fileName, projectContent] of projectExtraFiles)
            if (projectData.prevPolicyFiles.has(fileName)) {
                unlinkSync(join(projectDir, fileName));
                projectExtraFiles.delete(fileName);
            }

        // Ask what to do with different files
        if (differentFiles.size) {
            for (const [relPath, choice] of await showTable(inquirerFilesNotMatchConfig, [...differentFiles.keys()])) {
                // @ts-ignore
                await executeSelectedAction(
                    choice,
                    join(projectDir, relPath),
                    policyFiles.get(relPath)!,
                    policy.policyAbsPath,
                    !policy.files.has(relPath),
                );
            }
        }

        // Ask what to do with extra files
        if (projectExtraFiles.size) {
            for (const [relPath, choice] of await showTable(inquirerAdditionalFilesConfig, [...projectExtraFiles.keys()])) {
                // @ts-ignore
                await executeSelectedAction(
                    choice,
                    join(projectDir, relPath),
                    policyFiles.get(relPath)!,
                    policy.policyAbsPath,
                    !policy.files.has(relPath),
                );
            }
        }
    }

    // Compare all over again and save files matching the policy
    {
        Object.assign(projectData, readProject(projectDir));
        const { policy, policyFiles, matchingFiles } = compareWithPolicy(policies, projectData);
        const policyPrevMatchedData: any = {};
        for (const [fileName, projectContent] of matchingFiles) policyPrevMatchedData[fileName] = projectContent;

        const policyPrevMatchedDataStr = JSON.stringify(policyPrevMatchedData, undefined, "    ");
        writeFileSyncWithDir(join(projectDir, PROJECT_POLICY_PREV_CONTENT_FILENAME), policyPrevMatchedDataStr, "utf-8");
    }
    console.log(getFinishCheckProjectMessage());
}

async function executeSelectedAction(choice: string, absPath: string, fileContent: string, policyAbsPath: string, generated: boolean) {
    console.log(`CODE00000286 executeSelectedAction ${choice} ${absPath} ${policyAbsPath}`);
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
