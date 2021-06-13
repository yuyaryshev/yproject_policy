import { FileMap, GenFilesMap } from "./FileMap.js";
import { FilterCollection } from "./other.js";

export type PolicyOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export type PolicyCreateFunc = (configFileName: string) => Promise<void>;

export interface PolicyDefinition {
    policy: string;
    options: PolicyOptions;
    create: PolicyCreateFunc | undefined;
}

export interface PolicyData {
    policyName: string;
    options: PolicyOptions;
    policyAbsPath: string;
    files: FileMap;
    genFiles: GenFilesMap;
    create: PolicyCreateFunc | undefined;
}
