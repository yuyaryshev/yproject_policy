import { FileMap, GenFilesMap } from "./FileMap";
import { FilterCollection } from "./other";

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
