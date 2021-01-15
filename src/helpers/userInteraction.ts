import inquirer from "inquirer";

export const match: Match = async () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "match",
            message: "Files do not match. What are we gonna do?",
            choices: ["Replace", "Skip", "Compare"],
            filter: function (val: string) {
                return val.toLowerCase();
            },
        },
    ]);
};

export const additional: Additional = async () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "additional",
            message: "Project contains additional files weren't in policy. ",
            choices: ["Delete", "Skip"],
            filter: function (val: string) {
                return val.toLowerCase();
            },
        },
    ]);
};

export const policyNotFound: PolicyNotFound = async () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "policyNotFound",
            message: "Try to find policies at local_packages_folder?",
            choices: ["Try", "Skip"],
            filter: function (val: string) {
                return val.toLowerCase();
            },
        },
    ]);
};
