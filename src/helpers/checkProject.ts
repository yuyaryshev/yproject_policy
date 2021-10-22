import { PolicyData, ProjectData } from "../types/index.js";
import { outputFile, readFileSync, link, linkSync, unlink, unlinkSync, remove, removeSync, mkdirpSync, ensureDirSync } from "fs-extra";
import { resolve, basename, dirname, join } from "path";
import { makeParallel } from "ystd";

import {
    dirFilesOnly,
    expectNpmConfigKeyString,
    filterFiles,
    openFileDiffFromTextEditor,
    readProject,
    showTable,
    writeFileSyncIfChanged,
} from "../helpers/index.js";
import {
    NPM_CONF_COMPARITION_FOLDER,
    NPM_CONF_LOCAL_PACKAGES_FOLDER,
    POLICY_EXPECTS_FILE_PREFIX,
    PROJECT_POLICY_PREV_CONTENT_FILENAME,
} from "../constant/index.js";
import { FileDiffMap, FileMap } from "../types/FileMap.js";
import chalk from "chalk";
import { isMatch } from "micromatch";

export function compareWithPolicy(projectData: ProjectData) {
    const {
        policy,
        policyFiles,
        projectDir,
        projectFiles,
        policyConf: { policy: policyName, options: projectOptions },
    } = projectData;

    const projectExtraFiles: FileMap = new Map();
    for (const [fileName, projectContent] of projectFiles) {
        if (!policyFiles.has(fileName)) {
            // console.log("YYA09127312897");
            // console.log("YYA09127312897");
            // console.log("YYA09127312897");
            if (!policy.policyDefinition.options.allowedExtraFiles || !isMatch(fileName, policy.policyDefinition.options.allowedExtraFiles)) {
                projectExtraFiles.set(fileName, projectContent);
            }
        }
    }

    const matchingFiles: FileMap = new Map();
    const differentFiles: FileDiffMap = new Map();
    const policyExtraFiles: FileMap = new Map();
    for (const [fileName, policyFile] of policyFiles) {
        const projectContent = projectFiles.get(fileName) || "";
        if (!projectFiles.has(fileName)) {
            if (!policy.policyDefinition.options.allowedExtraFiles || !isMatch(fileName, policy.policyDefinition.options.allowedExtraFiles)) {
                if (!policyFile) {
                    console.trace("CODE00000096 YYADEBUG_undefined_policyContent");
                }
                policyExtraFiles.set(fileName, policyFile.policyContent);
            }
        } else {
            if (!policyFile) {
                console.trace("CODE00000204 YYADEBUG_undefined_policyContent");
            }
            if (policyFile.policyContent.trim() === projectContent.trim()) matchingFiles.set(fileName, policyFile.policyContent);
            else
                differentFiles.set(fileName, {
                    relativePath: fileName,
                    projectContent,
                    policyFile,
                });
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
            if (!d.policyFile) {
                console.trace("CODE00000205 YYADEBUG_undefined_policyContent");
            }
            writeFileSyncIfChanged(join(projectDir, fileName), d.policyFile.policyContent);
            matchingFiles.set(fileName, d.policyFile.policyContent);
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
    const projectName = basename(projectData.projectDir);
    {
        const { differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles } = projectAutofix(projectData);

        const comparition_folder = await expectNpmConfigKeyString(NPM_CONF_COMPARITION_FOLDER);
        if (comparition_folder.length) {
            removeSync(join(comparition_folder, "policy", projectName));
            removeSync(join(comparition_folder, "project", projectName));

            if (differentFiles.size) {
                mkdirpSync(join(comparition_folder, "policy", projectName));
                mkdirpSync(join(comparition_folder, "project", projectName));
            }

            const parallel = makeParallel();
            for (const [filePath, item] of differentFiles) {
                // link(existingPath, newPath);

                if (!item.policyFile) {
                    console.trace("CODE00000206 YYADEBUG_undefined_policyContent");
                }

                const filePathDir = dirname(filePath);
                if (filePathDir && filePathDir !== "." && filePathDir.length) {
                    ensureDirSync(join(comparition_folder, "policy", projectName, filePathDir));
                    ensureDirSync(join(comparition_folder, "project", projectName, filePathDir));
                }

                parallel.add([
                    item.policyFile.generated
                        ? outputFile(join(comparition_folder, "policy", projectName, filePath), item.policyFile.policyContent)
                        : link(join(projectData.policy.policyAbsPath, filePath), join(comparition_folder, "policy", projectName, filePath)),
                    link(join(projectDir, filePath), join(comparition_folder, "project", projectName, filePath)),
                ]);
            }
            await parallel.wait();
        }

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
                const rrrr = projectData.policyFiles.get(relPath);

                if (!rrrr) {
                    console.trace("CODE00000209 YYADEBUG_undefined_policyContent");
                    throw new Error("CODE00000210 YYADEBUG_undefined_policyContent");
                }

                // @ts-ignore
                await executeSelectedAction(choice, join(projectDir, relPath), rrrr.policyContent, projectData.policy.policyAbsPath, rrrr.generated);
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
                await executeSelectedAction(choice, join(projectDir, relPath), "", projectData.policy.policyAbsPath, false);
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

    {
        // Remove temporary files
        const files = filterFiles(dirFilesOnly(projectDir, projectData0.policy.policyDefinition), POLICY_EXPECTS_FILE_PREFIX + "*.*", []);
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
