import {FileMap} from "./FileMap";
import {FilterCollection} from "./other";
import {PolicyData} from "./policy";

export type ProjectOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export type ProjectPolicyConfig = {
    policy: string;
    options?: ProjectOptions;
};

export interface ProjectData {
    policyConf: ProjectPolicyConfig;
    projectFiles: FileMap;
    packageJson: object;
    projectDir: string;
    prevPolicyFiles: Set<string>;
    policy: PolicyData | undefined;
};


export interface ProjectDataWithPolicy extends ProjectData {
    policy: PolicyData;
};
