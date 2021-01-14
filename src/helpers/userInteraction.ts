import { User, Match, Additional } from "src/types";
// @ts-ignore
import inquirer from "inquirer";

type userInteraction = () => User;

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
