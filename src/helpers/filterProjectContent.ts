// import globby from "globby";
import { defaultFilterCollection } from "../constant/index.js";
import micromatch from "micromatch";
import arrayUnion from "array-union";
import { FileMap } from "../types/FileMap.js";
import { join, posix } from "path";
import { readdirSync } from "fs";
import { Filter, FilterCollection } from "../types/other.js";

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
    return micromatch(fileNames, includeFilters, opts);
}

export function dirFilesOnly(rootPath: string) {
    const dirents = readdirSync(rootPath, { withFileTypes: true });
    return dirents.filter((f) => !f.isDirectory()).map((f) => f.name);
}
