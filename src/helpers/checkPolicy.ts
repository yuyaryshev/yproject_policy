import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import { genPolicyFiles, writeFileSyncWithDir, match } from "../helpers";
import { POLICY_EXPECTS_FILE_PREFIX } from "../constant";
import { openFileDiffFromTextEditor } from "./terminal";
import chalk from "chalk";
import { removeFileSync } from "./writeFileSyncWithDir";

type checkPolicy = (policyData: PolicyData, projectData: ProjectData) => Promise<void>;

export const checkPolicy: checkPolicy = async (policyData, projectData) => {
    const { location: projectDir, files: projectFiles } = projectData;
    const policyFiles: FileMap = new Map([...genPolicyFiles(policyData, projectData), ...policyData.files]);

    for (let [relPath, content] of policyFiles) {
        try {
            if (projectFiles.has(relPath)) {
                if (projectFiles.get(relPath) !== content) {
                    console.log("SHOW DIFF: ", relPath);
                    await showFileDiff(join(projectDir, relPath), content);
                }
            } else writeFileSyncWithDir(join(projectDir, relPath), content);
        } catch (error) {
            console.error(error.message);
            process.exit(5);
        }
    }

    for (let path of projectFiles.keys()) {
        try {
            if (!policyFiles.has(path)) {
                // TODO: find extra files in project print message
                console.log("FIND EXTRA FILE IN PROJECT: ", path);
                // TODO: тут нужно варианты добавить что с ними делать (пропустить или удалить)
            }
        } catch (error) {
            console.error(error.message);
            process.exit(5);
        }
    }
};

type showFileDiff = (path: string, content: string) => Promise<void>;

export const showFileDiff: showFileDiff = async (path, content) => {
    try {
        const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
        writeFileSyncWithDir(expectsFilePath, content);
        console.log(chalk.red("CREATED FILE: ", expectsFilePath));
        console.log("FOR SHOW DIFF: ", path);

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
    } catch (error) {
        console.error(error.message);
        process.exit(5);
    }
};
