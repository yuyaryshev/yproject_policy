import chalk from "chalk";
import { LOCAL_PACKAGES_FOLDER } from "./";

export function getErrorMissingPolicyMessage(policyName: string, projectDir: string) {
    return chalk.red(`CODE00000000 Missing policy (${policyName}) for project (${projectDir}}).`);
}

export function getStartCheckProjectMessage(policyName: string, projectDir: string) {
    return chalk.blue(`CHECK POLICY (${policyName}) FOR PROJECT (${projectDir})`);
}

export function getCommandOptionAllDescription() {
    return `will check all your projects in "${LOCAL_PACKAGES_FOLDER}"`;
}

export function getMissingLocalPackagesError() {
    return chalk.red(`CODE00000000 Please use 'npm config set ${LOCAL_PACKAGES_FOLDER}' to define projects folder.`);
}

export function getFinishMessage() {
    return chalk.green("FINISH");
}

export function getFilesNotMatchMessage() {
    return chalk.bgWhite.red("Files do not match. What are we gonna do?");
}

export function getFindAdditionalFilesMessage() {
    return chalk.bgWhite.red("Additional files found. What are we gonna do?");
}

export function getCreateFileMessage(path: string) {
    return chalk.cyan(`CREATED FILE: ${path}`);
}

export function getMissingTextEditorError() {
    return chalk.red("CODE00000000 Text editor not found. Please use 'npm config set ${TEXT_EDITOR}' to define projects folder.");
}

export function getRunTextEditorMessage() {
    return chalk.bgGreen.black("Running text editor...");
}
