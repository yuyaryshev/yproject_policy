import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import {genPolicyFiles, writeFileSyncWithDir, match, policyNotFound} from "../helpers";
import { POLICY_EXPECTS_FILE_PREFIX } from "../constant";
import fs from "fs";
import chalk from "chalk";

type checkPolicy = (policyData: PolicyData, projectData: ProjectData) => void;

export const checkPolicy: checkPolicy = async (policyData, projectData) => {
    const { location: projectDir, files: projectFiles } = projectData;
    const policyFiles: FileMap = new Map([...genPolicyFiles(policyData, projectData), ...policyData.files]);

    for (let [relPath, content] of policyFiles) {
        try {
            if (projectFiles.has(relPath)) {
                if (projectFiles.get(relPath) !== content) {
                    console.log("SHOW DIFF: ", relPath);
                    // TODO: use Meld to show file diff (create expects file)
                    await showFileDiff(join(projectDir, relPath), content);
                } else {
                    // TODO: file is ident skip or print message
                    //console.log("FILES IDENT", relPath);
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
            }
        } catch (error) {
            console.error(error.message);
            process.exit(5);
        }
    }
};

type showFileDiff = (path: string, content: string) => void;

export const showFileDiff: showFileDiff = async (path, content) => {
    try {
        const expectsFilePath = join(dirname(path), `${POLICY_EXPECTS_FILE_PREFIX}${basename(path)}`);
        writeFileSyncWithDir(expectsFilePath, content);
        console.log(chalk.red("CREATED FILE: ", expectsFilePath));
        console.log("FOR SHOW DIFF: ", path);

        //TODO: use meld for show difference
        const mat = await match().then(prom => prom.match)
        if (mat === "compare"){
            //open meld
        }else if(mat === "replace"){
            //fs.copyFileSync()
        }
    } catch (error) {
        console.error(error.message);
        process.exit(5);
    }
};
