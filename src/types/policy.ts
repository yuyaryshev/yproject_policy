import { FileMap, FilterCollection, GenFilesMap } from "./index";

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
    files: FileMap;
    genFiles: GenFilesMap;
};

export type PolicyFileGenerator = {
    generate: (packageJson: object, policyOptions: PolicyOptions) => string;
};
