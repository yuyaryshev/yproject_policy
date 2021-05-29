// import globby from "globby";
import { defaultFilterCollection } from "../constant";
import micromatch from "micromatch";
import arrayUnion from "array-union";
import {FileMap} from "../types/FileMap";
import {join, posix} from "path";
import {readdirSync} from "fs";
import {Filter, FilterCollection} from "../types/other";

export function filterFiles(rootPath: string, includeFilters: FilterCollection | Filter = "**", excludeFilters: FilterCollection = []): Array<string> {
    const dirents = readdirSync(rootPath, { withFileTypes: true });
    const files = dirents.filter(f => !f.isDirectory()).map(f=> f.name);
    return micromatch(files, includeFilters, {
        dot: true,
        ignore: arrayUnion(defaultFilterCollection, excludeFilters),
    });


    // const posixPath = posix.normalize(rootPath);
    // return globby.sync(includeFilters, {
    //     expandDirectories: false,
    //     gitignore: false,
    //     onlyFiles: true,
    //     cwd: posixPath,
    //     ignore: arrayUnion(defaultFilterCollection, excludeFilters),
    //     dot: true,
    // });
}

export function filterExcludeFilesFromPolicy(policyFiles: FileMap, excludeFilters: FilterCollection = []): FileMap {
    if (!excludeFilters.length) return policyFiles;
    const result = new Map();
    micromatch([...policyFiles.keys()], "**", {
        dot: true,
        ignore: excludeFilters,
    }).forEach((path) => result.set(path, policyFiles.get(path)));

    return result;
}
