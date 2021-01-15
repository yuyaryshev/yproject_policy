import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import { genPolicyFiles, writeFileSyncWithDir, match, additional, openFileDiffFromTextEditor, removeFileSync } from "../helpers";
import { POLICY_EXPECTS_FILE_PREFIX } from "../constant";
import chalk from "chalk";

export async function checkPolicy(policyData: PolicyData, projectData: ProjectData): Promise<void> {
    const { location: projectDir, files: projectFiles } = projectData;
    const policyFiles: FileMap = new Map([...genPolicyFiles(policyData, projectData), ...policyData.files]);

    for (let [relPath, content] of policyFiles) {
        if (projectFiles.has(relPath)) {
            if (projectFiles.get(relPath) !== content) await showFileDiff(join(projectDir, relPath), content);
        } else writeFileSyncWithDir(join(projectDir, relPath), content);
    }

    for (let path of projectFiles.keys()) {
        if (!policyFiles.has(path)) {
            console.log("FIND EXTRA FILE IN PROJECT: ", path);
            let exit = false;
            while (!exit) {
                const mat = (await additional(path)).additional;
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
    console.log("FIND DIFF: ", path);
    const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
    writeFileSyncWithDir(expectsFilePath, content);
    console.log(chalk.red("CREATED FILE: ", expectsFilePath));

    let exit = false;
    while (!exit) {
        const mat = await match().then((prom) => prom.match);
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
