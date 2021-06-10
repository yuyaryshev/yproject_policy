import { FileMap } from "./FileMap.js";
import { FilterCollection } from "./other.js";
import { PolicyData } from "./policy.js";

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
}
