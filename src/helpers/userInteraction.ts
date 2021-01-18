import inquirer from "inquirer";

inquirer.registerPrompt("table", require("inquirer-table-prompt"));

export async function showTable(rowsIn: Array<string>, columnsIn: Array<string>, Question: string) {
    let columnsPush: Array<{name: string, value: string}> = []
    for (let col of columnsIn){
        columnsPush.push({
            name: col,
            value: col,
        })
    }
    let rowsPush: Array<{name: string, value: number}> = []
    let count = 0
    for (let row of rowsIn){
        rowsPush.push({
            name: row,
            value: count,
        })
        count++
    }
    const answers = (
    await inquirer
        .prompt([
            {
                type: "table",
                name: "answers",
                message: Question,
                columns: columnsPush,
                rows: rowsPush,
            }
        ])).answers;
    let answersToReturn: Array<string> = []
    for (let ans of answers){
        if (ans != undefined){
            answersToReturn.push(ans)
        } else {
            answersToReturn.push("none")
        }
    }
    return answersToReturn
}