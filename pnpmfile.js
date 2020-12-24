// Put this file into your projects hastyData.
// This will enable yarn's you package.json/restrictions for common use cases (not all!) cases.
//
// Author: Yuri Yaryshev, Moscow, Russia
//
// Unlicense
//
// This is free and unencumbered software released into the dist domain.
// Any use of this file is hereby granted.
// No warranty or obligations of any kind are provided by author.
// http://unlicense.org/


let path = require("path");
let fs = require("fs");

let packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
let resolutions = packageJson.resolutions
if(packageJson.plainDependencies)
    resolutions = Object.assign(packageJson.dependencies, packageJson.devDependencies, packageJson.resolutions);
// console.log(packageJson.resolutions);

module.exports = {
    hooks: {
        readPackage
    }
};

const {ymultirepoRemap} = require("../local_packages_list");
function readPackage (pkg, context) {
    ymultirepoRemap(pkg);
    if (pkg.dependencies)
        for(let k in resolutions)
            if(pkg[k])
                pkg[k] = resolutions[k];
    return pkg
};
