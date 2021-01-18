import { FileMap, PolicyData, ProjectData } from "../types";
import { basename, dirname, join } from "path";
import { genPolicyFiles, writeFileSyncWithDir, openFileDiffFromTextEditor, removeFileSync, showTable } from "../helpers";
import { POLICY_EXPECTS_FILE_PREFIX, FILES_NOT_MATCH, ADDITIONAL_FILES } from "../constant";
import chalk from "chalk";

export async function checkPolicy(policyData: PolicyData, projectData: ProjectData): Promise<void> {
    const { location: projectDir, files: projectFiles } = projectData;
    const policyFiles: FileMap = new Map([...genPolicyFiles(policyData, projectData), ...policyData.files]);

    let coincidence: Array<string> = []
    for (let [relPath, content] of policyFiles) {
        if (projectFiles.has(relPath)) {
            if (projectFiles.get(relPath) !== content){
                coincidence.push(relPath)
            }
        } else writeFileSyncWithDir(join(projectDir, relPath), content);
    }
    const answersNotMatch = await showTable(coincidence, ["compare", "replace", "skip"], FILES_NOT_MATCH)
    await handleNotMatch(answersNotMatch, coincidence, policyFiles)

    const pathList = [...projectFiles.keys()].filter(p=>!policyFiles.has(p));
    const answersToAdditionalFiles = await showTable(pathList, ["delete", "skip"], ADDITIONAL_FILES)
    await handleAddFiles(answersToAdditionalFiles, pathList)
}

async function handleAddFiles(answers: Array<string>, pathList: Array<string>){
    for (let i = 0; answers[i] != undefined; i++){
        if (answers[i] === "delete"){
            removeFileSync(pathList[i])
        }
    }
}

async function handleNotMatch(answers: Array<string>, pathList: Array<string>, policyFiles: FileMap){
    for (let i = 0; answers[i] != undefined; i++){
        if (answers[i] === "compare"){
            const expectsFilePath = join(dirname(pathList[i]), `${POLICY_EXPECTS_FILE_PREFIX}${basename(pathList[i])}`);
            await openFileDiffFromTextEditor(expectsFilePath, pathList[i]);
        } else if (answers[i] === "replace"){
            writeFileSyncWithDir(pathList[i], policyFiles.get(pathList[i]) || 'Content not found');
        }
    }
}