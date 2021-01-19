import globby from "globby";
import { FileMap, Filter, FilterCollection } from "../types";
import { defaultFilterCollection } from "../constant";
import micromatch from "micromatch";
import arrayUnion from "array-union";
import dirGlob from "dir-glob";

export function filterFiles(posixPath: string, includeFilters: FilterCollection | Filter = "", excludeFilters: FilterCollection = []): Array<string> {
    return globby.sync(includeFilters, {
        onlyFiles: true,
        cwd: posixPath,
        ignore: arrayUnion(defaultFilterCollection, excludeFilters),
        dot: true,
    });
}

export function filterExcludeFilesFromPolicy(policyFiles: FileMap, excludeFilters: FilterCollection = []): FileMap {
    if (!excludeFilters.length) return policyFiles;
    const result = new Map();
    micromatch([...policyFiles.keys()], "**", {
        dot: true,
        ignore: dirGlob.sync(excludeFilters),
    }).forEach((path) => result.set(path, policyFiles.get(path)));

    return result;
}
