import { Dirent } from "fs";

export type ReadDirCallback = (path: string, dirEntry: Dirent) => true | false | undefined | void;

export type ReadDirCallback2 = (path: string, filename: Dirent, parentResult?: any | undefined) => any | undefined | void;

export type PolicyOptions = {
    ignored?: Array<string>;
    exclude?: Array<string>;
    [x: string]: any;
};

export type PolicyFileGenerator = {
    generate: (packageJson: object, policyOptions: object) => string;
};

export type PolicyDefinition = {
    policy: string;
    defaultOptions: PolicyOptions;
};

export type PolicyData = {
    policy: PolicyDefinition | undefined;
    files: FileMap;
    genFiles: Map<string, PolicyFileGenerator>;
};

export type PolicyCollection = Map<string, PolicyData>;

export type FileMap = Map<string, string>;
