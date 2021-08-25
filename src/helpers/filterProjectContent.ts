// import globby from "globby";
import { defaultFilterCollection } from "../constant/index.js";
import micromatch from "micromatch";
import arrayUnion from "array-union";
import { FileMap } from "../types/FileMap.js";
import { join, posix } from "path";
import { ensureDirSync, readdirSync } from "fs-extra";
import { Filter, FilterCollection } from "../types/other.js";
import { PolicyData, PolicyDefinition } from "../types/index.js";

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

export function dirFilesOnly(rootPath: string, policyDefinition: PolicyDefinition) {
    const dirents = readdirSync(rootPath, { withFileTypes: true });
    const fileNames = dirents.filter((f) => !f.isDirectory()).map((f) => f.name);

    if (policyDefinition.options.addSubdirs)
        for (const additionalSubdir of policyDefinition.options.addSubdirs) {
            try {
                ensureDirSync(join(rootPath, ...additionalSubdir));
                const dirents2 = readdirSync(join(rootPath, ...additionalSubdir), { withFileTypes: true });
                const fileNames2 = dirents2.filter((f) => !f.isDirectory()).map((f) => join(...additionalSubdir, f.name));
                fileNames.push(...fileNames2);
            } catch (e) {
                console.warn(`CODE00000284 ${e.message} ${e.stack}`);
            }
        }
    return fileNames;
}
