import { Dirent } from "fs";

export type ReadDirCallback = (path: string, dirEntry: Dirent) => true | false | undefined | void;

export type ReadDirCallback2 = (path: string, filename: Dirent, parentResult?: any | undefined) => any | undefined | void;

export type PolicyOptions = {
    ignored?: Array<string>;
    exclude?: Array<GlobbyPattern>;
    [x: string]: any;
};

export type PolicyFileGenerator = {
    generate: (packageJson: object, policyOptions: PolicyOptions) => string;
};

export type PolicyDefinition = {
    policy: string;
    defaultOptions: PolicyOptions;
};

export type GenFilesMap = Map<string, PolicyFileGenerator>;

export type PolicyData = {
    policy: PolicyDefinition;
    files: FileMap;
    genFiles: GenFilesMap;
};

export type ExcludeFromProject = {
    directories: Array<string>;
    files: Array<string>;
};

export type ProjectPolicyConfig = {
    policy: string;
    options?: PolicyOptions;
};

export type ProjectData = {
    policyConf: ProjectPolicyConfig;
    files: FileMap;
    packageJson: object;
    location: string;
};

export type FileMap = Map<string, string>;

export type User = any;

export type Match = () => Promise<{ match: string }>;

export type Additional = () => Promise<{ additional: string }>;

export type PolicyNotFound = () => Promise<{ policyNotFound: string }>;

export type GlobbyPattern = string;

export type GlobbyPatternCollection = Array<string>;

export type PackagesCollection = {
    policies: Map<string, PolicyData>;
    projects: Map<string, ProjectData>;
};
