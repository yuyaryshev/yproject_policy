import {User, Match, Additional} from "src/types";


const inquirer = require('inquirer');

type userInteraction = () => User;

export const match: Match = async() => {
    const answer = await
    inquirer
        .prompt([
            {
                type: "list",
                name: "match",
                message: "Files do not match. What are we gonna do?",
                choices: ["Replace", "Skip", "Compare"],
                filter: function (val: string) {
                    return val.toLowerCase();
                },
            },
        ])
    return answer
}

export const additional: Additional = async() => {
    const answer = await
    inquirer
        .prompt([
            {
                type: "list",
                name: "additional",
                message: "Project contains additional files weren't in policy. ",
                choices: ["Delete", "Skip"],
                filter: function (val: string) {
                    return val.toLowerCase();
                },
            },
        ])
    return answer
};


export const userInteraction: userInteraction = async() => {
    console.log(await match())
    console.log(await additional())
}
