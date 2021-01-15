import inquirer from "inquirer";

export async function showQuestion(Question: {question: string,  answers: Array<string>}, AdditionalMessage = "") {
    return inquirer.prompt([
        {
            type: "list",
            name: "answer",
            message: Question.question + " " + AdditionalMessage,
            choices: Question.answers,
            filter: function (val: string) {
                return val.toLowerCase();
            },
        },
    ]);
}


