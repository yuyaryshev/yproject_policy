import { FileMap, GenFilesMap } from "./FileMap.js";
import { FilterCollection } from "./other.js";

export type PolicyOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export interface PolicyDefinition {
    policy: string;
    options: PolicyOptions;
}

export interface PolicyData {
    policyName: string;
    options: PolicyOptions;
    policyAbsPath: string;
    files: FileMap;
    genFiles: GenFilesMap;
}
