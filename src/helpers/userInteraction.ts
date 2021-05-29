import inquirer from "inquirer";
import { INQUIRER_CHOICES } from "../constant";
import {InquirerTableCell, InquirerTableConfig} from "../types/other";

inquirer.registerPrompt("table", require("inquirer-table-prompt"));

export async function showTable(config: InquirerTableConfig, rows: Array<string>): Promise<Map<string, string>> {
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
        result.set(name, answers[index] ?? "SKIP");
    });

    return result;
}
