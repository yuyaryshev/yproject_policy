import inquirer from "inquirer";
import { InquirerTableCell, InquirerTableConfig } from "../types";
import { INQUIRER_CHOICES } from "../constant";

inquirer.registerPrompt("table", require("inquirer-table-prompt"));

export async function showTable(config: InquirerTableConfig, rows: Array<string>): Promise<Map<string, string>> {
    const {
        none: { value: defaultValue },
    } = INQUIRER_CHOICES;
    const formattedRows: Array<InquirerTableCell> = rows.map((name) => ({ name, value: name }));

    const answers: Array<string | undefined> = (
        await inquirer.prompt([
            {
                type: "table",
                name: "answers",
                ...config,
                rows: formattedRows,
            },
        ])
    ).answers;

    const result = new Map();

    formattedRows.forEach(({ name }, index) => {
        result.set(name, answers[index] ?? defaultValue);
    });

    return result;
}
