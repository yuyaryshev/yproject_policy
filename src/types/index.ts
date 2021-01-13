import { Dirent } from "fs";

export type ReadDirCallback = (path: string, dirEntry: Dirent) => true | false | undefined | void;

export type ReadDirCallback2 = (path: string, filename: Dirent, parentResult?: any | undefined) => any | undefined | void;

export type PolicyOptions = {
    ignored?: Array<string>;
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
    policy: PolicyDefinition;
    files: FileMap;
    genFiles: Map<string, PolicyFileGenerator>;
};

export type ExcludeFromPolicy = {
    directories: Array<string>;
    files: Array<string>;
};

export type ExcludeFromProject = {
    directories: Array<string>,
    files: Array<string>,
};

export type ProjectPolicyConfig = {
    policy: string;
    options?: PolicyOptions;
};

export type ProjectData = {
    policyConf: ProjectPolicyConfig | undefined;
    files: FileMap;
    packageJson: object | undefined;
    location: string;
};

export type PolicyCollection = Map<string, PolicyData>;

export type ProjectCollection = Map<string, ProjectData>;

export type FileMap = Map<string, string>;

export type User = any;

export type Match = () => Promise<{match: string}>;

export type Additional = () => Promise<{additional: string}>;