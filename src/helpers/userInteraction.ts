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
    for (let i = 0; rowsIn[i] != undefined; i++){
        rowsPush.push({
            name: rowsIn[i],
            value: i,
        })
    }
    return (
    await inquirer
        .prompt([
            {
                type: "table",
                name: "answers",
                message: Question,
                columns: columnsPush,
                rows: rowsPush,
            }
        ])
    ).answers.map(replaceUndefinedAnswer)
}

function replaceUndefinedAnswer(answer: string){
    if (answer != undefined){
        return answer
    } else {
        return "none"
    }
}