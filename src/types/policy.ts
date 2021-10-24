import { FileMap, GenFilesMap, PolicyFileMap } from "./FileMap.js";
import { FilterCollection } from "./other.js";

export type PolicyOptions = {
    exclude?: FilterCollection;
    allowDifferent?: string[];
    addSubdirs?: string[][];
    allowedExtraFiles?: string[];
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
    files: PolicyFileMap;
    genFiles: GenFilesMap;
    create: PolicyCreateFunc | undefined;
    policyDefinition: PolicyDefinition;
}
