// import globby from "globby";
import { defaultFilterCollection } from "../constant";
import micromatch from "micromatch";
import arrayUnion from "array-union";
import { FileMap } from "../types/FileMap";
import { join, posix } from "path";
import { readdirSync } from "fs";
import { Filter, FilterCollection } from "../types/other";

export function mergeGlobs(...filters: (FilterCollection | undefined)[]): FilterCollection {
    const r: FilterCollection = [];
    for (const f of filters) if (f) r.push(...f);
    return r;
}

export function filterFiles(
    fileNames: string[],
    includeFilters: FilterCollection | Filter = "**",
    excludeFilters: FilterCollection = [],
): Array<string> {
    const opts = {
        dot: true,
        ignore: arrayUnion(defaultFilterCollection, excludeFilters),
    };
    const filteredFileNames = micromatch(fileNames, includeFilters, opts);
    // console.log("opts=", opts);
    // console.log("fileNames=", fileNames);
    // console.log("filteredFileNames=", filteredFileNames);
    return filteredFileNames;
}

export function dirFilesOnly(rootPath: string) {
    const dirents = readdirSync(rootPath, { withFileTypes: true });
    const files = dirents.filter((f) => !f.isDirectory()).map((f) => f.name);
    return files;
}
