import { PolicyData, ProjectData } from "../types";
import { readFileSync } from "fs-extra";
import { basename, dirname, join } from "path";
import { dirFilesOnly, filterFiles, openFileDiffFromTextEditor, readProject, showTable, writeFileSyncIfChanged } from "../helpers";
import { POLICY_EXPECTS_FILE_PREFIX, PROJECT_POLICY_PREV_CONTENT_FILENAME } from "../constant";
import { FileDiffMap, FileMap } from "../types/FileMap";
import { readdirSync, unlinkSync } from "fs";
import chalk from "chalk";

export function compareWithPolicy(projectData: ProjectData) {
    const {
        policy,
        policyFiles,
        projectDir,
        projectFiles,
        policyConf: { policy: policyName, options: projectOptions },
    } = projectData;

    const projectExtraFiles: FileMap = new Map();
    for (const [fileName, projectContent] of projectFiles) if (!policyFiles.has(fileName)) projectExtraFiles.set(fileName, projectContent);

    const matchingFiles: FileMap = new Map();
    const differentFiles: FileDiffMap = new Map();
    const policyExtraFiles: FileMap = new Map();
    for (const [fileName, policyContent] of policyFiles) {
        const projectContent = projectFiles.get(fileName) || "";
        if (!projectFiles.has(fileName)) policyExtraFiles.set(fileName, policyContent);
        else {
            if (policyContent.trim() === projectContent.trim()) matchingFiles.set(fileName, policyContent);
            else differentFiles.set(fileName, { projectContent, policyContent });
        }
    }
    return { matchingFiles, differentFiles, projectExtraFiles, policyExtraFiles };
}

export function projectAutofix(projectData: ProjectData) {
    const { projectDir } = projectData;
    const { differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles } = compareWithPolicy(projectData);

    // Add policy files
    for (const [fileName, policyContent] of policyExtraFiles) {
        writeFileSyncIfChanged(join(projectDir, fileName), policyContent);
        matchingFiles.set(fileName, policyContent);
        policyExtraFiles.delete(fileName);
    }

    // Overwrite unchagned files
    for (const [fileName, d] of differentFiles)
        if (projectData.prevPolicyFiles.has(fileName)) {
            writeFileSyncIfChanged(join(projectDir, fileName), d.policyContent);
            matchingFiles.set(fileName, d.policyContent);
            differentFiles.delete(fileName);
        }

    // Delete old policy files
    for (const [fileName, projectContent] of projectExtraFiles)
        if (projectData.prevPolicyFiles.has(fileName)) {
            unlinkSync(join(projectDir, fileName));
            projectExtraFiles.delete(fileName);
        }

    return { differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles };
}

export async function checkProject(policies: Map<string, PolicyData>, projectData0: ProjectData): Promise<void> {
    if (!projectData0.policy) return;

    const projectData: ProjectData = projectData0 as ProjectData;
    console.log(`CODE00000099 ${projectData.projectDir} - checkProject started`);

    const { projectDir } = projectData;
    {
        const { differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles } = projectAutofix(projectData);

        // Ask what to do with different files
        if (differentFiles.size) {
            const results = await showTable(
                {
                    message: chalk.bgWhite.red("CODE00000097 Files do not match. What are we gonna do?"),
                    columns: [
                        {
                            name: "Skip",
                            value: "SKIP",
                        },
                        {
                            name: "Overwrite in project",
                            value: "REPLACE",
                        },
                        {
                            name: "Compare",
                            value: "COMPARE",
                        },
                    ],
                    pageSize: 20,
                },
                [...differentFiles.keys()],
            );
            for (const [relPath, choice] of results) {
                // @ts-ignore
                await executeSelectedAction(
                    choice,
                    join(projectDir, relPath),
                    projectData.policyFiles.get(relPath)!,
                    projectData.policy.policyAbsPath,
                    !projectData.policy.files.has(relPath),
                );
            }
        }

        // Ask what to do with extra files
        if (projectExtraFiles.size) {
            const results = await showTable(
                {
                    message: chalk.bgWhite.red("CODE00000098 Additional files found. What are we gonna do?"),
                    columns: [
                        {
                            name: "Skip",
                            value: "SKIP",
                        },
                        {
                            name: "Remove from project",
                            value: "REMOVE",
                        },
                        {
                            name: "Add to policy",
                            value: "TO_POLICY",
                        },
                        {
                            name: "View file",
                            value: "VIEW_FILE",
                        },
                    ],
                    pageSize: 20,
                },
                [...projectExtraFiles.keys()],
            );
            for (const [relPath, choice] of results) {
                // @ts-ignore
                await executeSelectedAction(
                    choice,
                    join(projectDir, relPath),
                    projectData.policyFiles.get(relPath)!,
                    projectData.policy.policyAbsPath,
                    !projectData.policy.files.has(relPath),
                );
            }
        }
    }

    // Compare all over again and save files matching the policy
    {
        Object.assign(projectData, readProject(projectDir, policies));
        const { matchingFiles } = compareWithPolicy(projectData);
        const policyPrevMatchedData: any = {};
        for (const [fileName, projectContent] of matchingFiles) policyPrevMatchedData[fileName] = projectContent;

        const policyPrevMatchedDataStr = JSON.stringify(policyPrevMatchedData, undefined, "    ");
        writeFileSyncIfChanged(join(projectDir, PROJECT_POLICY_PREV_CONTENT_FILENAME), policyPrevMatchedDataStr);
    }

    { // Remove temporary files
        const files = filterFiles(dirFilesOnly(projectDir), POLICY_EXPECTS_FILE_PREFIX + "*.*", []);
        // console.log(`CODE00000189 Files to be deleted\n`, JSON.stringify(files, undefined, "    "));
        for (const filename of files) unlinkSync(join(projectDir, filename));
    }

    console.log(chalk.green(`CODE00000201 ${projectData.projectDir} checkProject - completed.`));
}

async function executeSelectedAction(choice: string, absPath: string, fileContent: string, policyAbsPath: string, generated: boolean) {
    console.log(`CODE00000286 executeSelectedAction ${choice} ${absPath} ${policyAbsPath}`);
    switch (choice) {
        case "REPLACE":
            writeFileSyncIfChanged(absPath, fileContent);
            break;
        case "COMPARE":
            if (!generated) await showFileDiffFile(absPath, policyAbsPath);
            else await showFileDiffGen(absPath, fileContent);
            break;
        case "VIEW_FILE":
            await showFileDiffGen(absPath, "");
            break;
        case "REMOVE":
            unlinkSync(absPath);
            break;
        case "TO_POLICY":
            writeFileSyncIfChanged(join(policyAbsPath, basename(absPath)), readFileSync(absPath, "utf-8"));
            break;
        default:
    }
}

export async function showFileDiffFile(path: string, policyAbsPath: string): Promise<void> {
    await openFileDiffFromTextEditor(join(policyAbsPath, basename(path)), path);
}

export async function showFileDiffGen(path: string, content: string): Promise<void> {
    const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
    writeFileSyncIfChanged(expectsFilePath, content);
    await openFileDiffFromTextEditor(expectsFilePath, path);
}

export function exceptPolicy(policies: Map<string, PolicyData>, policyName: string, projectName: string) {
    const policy = policies.get(policyName);
    if (!policy) {
        const e = new Error(`CODE00000198 Missing policy (${policyName}) for project (${projectName}}).`);
        (e as any).code = "EPOLICY_NOT_EXISTS";
        throw e;
    }
    return policy;
}
