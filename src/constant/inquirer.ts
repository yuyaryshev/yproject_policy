import { getFilesNotMatchMessage, getFindAdditionalFilesMessage } from "./dictionary";
import { InquirerTableCell, InquirerTableConfig } from "../types";

export const INQUIRER_CHOICES: { [x: string]: InquirerTableCell } = {
    replace: {
        name: "Replace",
        value: "REPLACE",
    },
    skip: {
        name: "Skip",
        value: "SKIP",
    },
    compare: {
        name: "Compare",
        value: "COMPARE",
    },
    none: {
        name: "None",
        value: "NONE",
    },
    remove: {
        name: "Remove",
        value: "REMOVE",
    },
};

export const inquirerFilesNotMatchConfig: InquirerTableConfig = {
    message: getFilesNotMatchMessage(),
    columns: [INQUIRER_CHOICES.replace, INQUIRER_CHOICES.compare, INQUIRER_CHOICES.skip],
};

export const inquirerAdditionalFilesConfig: InquirerTableConfig = {
    message: getFindAdditionalFilesMessage(),
    columns: [INQUIRER_CHOICES.remove, INQUIRER_CHOICES.skip],
};
