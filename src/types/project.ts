import {FileMap} from "./FileMap";
import {FilterCollection} from "./other";
import {PolicyData} from "./policy";

export type ProjectPolicyOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export type ProjectPolicyConfig = {
    policy: string;
    options?: ProjectPolicyOptions;
};

export interface ProjectData {
    policyConf: ProjectPolicyConfig;
    projectFiles: FileMap;
    policyFiles: FileMap;
    packageJson: object;
    projectDir: string;
    prevPolicyFiles: Set<string>;
    policy: PolicyData;
};
