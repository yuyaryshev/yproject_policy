import chalk from "chalk";
import { LOCAL_PACKAGES_FOLDER } from "./";

export const LANG_DICTIONARY_DYNAMIC: { [x: string]: (...rest: string[]) => string } = {
    ERROR_MISSING_POLICY_FOR_PROJECT: function (policyName, projectDir) {
        return chalk.red(`CODE00000000 Missing policy (${policyName}) for project (${projectDir}}).`);
    },
    MESSAGE_START_CHECK_POLICY_FOR_PROJECT: function (policyName, projectDir) {
        return chalk.blue(`CHECK POLICY (${policyName}) FOR PROJECT (${projectDir})`);
    },
};

export const LANG_DICTIONARY_STATIC: { [x: string]: string } = {
    COMMAND_OPTION_ALL_DESCRIPTION: `will check all your projects in "${LOCAL_PACKAGES_FOLDER}"`,
    ERROR_MISSING_LOCAL_PACKAGES_FOLDER: chalk.red(`CODE00000000 Please use 'npm config set ${LOCAL_PACKAGES_FOLDER}' to define projects folder.`),
};
