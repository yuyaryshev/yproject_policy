import { getFilesNotMatchMessage, getFindAdditionalFilesMessage } from "./dictionary";
import { InquirerTableCell, InquirerTableConfig } from "../types";

export const INQUIRER_CHOICES: { [x: string]: InquirerTableCell } = {
    none: {
        name: "None",
        value: 0,
    },

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

    remove: {
        name: "Remove",
        value: "REMOVE",
    },
    to_policy: {
        name: "Add to policy",
        value: "TO_POLICY",
    },
};

export const inquirerFilesNotMatchConfig: InquirerTableConfig = {
    message: getFilesNotMatchMessage(),
    columns: [INQUIRER_CHOICES.skip, INQUIRER_CHOICES.compare, INQUIRER_CHOICES.replace],
    pageSize: 20,
};

export const inquirerAdditionalFilesConfig: InquirerTableConfig = {
    message: getFindAdditionalFilesMessage(),
    columns: [INQUIRER_CHOICES.skip, INQUIRER_CHOICES.remove, INQUIRER_CHOICES.to_policy],
    pageSize: 20,
};
