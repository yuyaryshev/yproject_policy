import {FilterCollection} from "./index";
import {FileMap, GenFilesMap} from "./FileMap";

export type PolicyOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export type PolicyDefinition = {
    policy: string;
    options: PolicyOptions;
};

export type PolicyData = {
    policy: PolicyDefinition;
    policyAbsPath: string;
    files: FileMap;
    genFiles: GenFilesMap;
};

