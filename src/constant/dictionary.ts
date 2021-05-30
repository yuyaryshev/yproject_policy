import chalk from "chalk";
import { LOCAL_PACKAGES_FOLDER } from "./";

export function getErrorMissingPolicyMessage(policyName: string, projectDir: string) {
    return chalk.red(`CODE00000201 Missing policy (${policyName}) for project (${projectDir}}).`);
}

export function getStartCheckProjectMessage(policyName: string, projectDir: string) {
    return chalk.bgBlue.white(`Start project review (${projectDir}) for compliance with (${policyName}) policy...`);
}

export function getCommandOptionAllDescription() {
    return `will check all your projects in "${LOCAL_PACKAGES_FOLDER}"`;
}

export function getMissingLocalPackagesError() {
    return chalk.red(`CODE00000284 Please use 'npm config set ${LOCAL_PACKAGES_FOLDER}' to define projects folder.`);
}

export function getFinishMessage() {
    return chalk.green("Work yproject_policy completed.");
}

export function getFinishCheckProjectMessage() {
    return chalk.bgGreen.black(`Project review policy completed.`);
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
    return chalk.red("CODE00000285 Text editor not found. Please use 'npm config set ${DIFF_EDITOR}' to define projects folder.");
}

export function getRunTextEditorMessage() {
    return chalk.bgGreen.black("Running text editor...");
}
