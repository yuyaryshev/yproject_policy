import {FileMap} from "./FileMap";
import {FilterCollection} from "./other";

export type ProjectOptions = {
    exclude?: FilterCollection;
    [x: string]: any;
};

export type ProjectPolicyConfig = {
    policy: string;
    options?: ProjectOptions;
};

export type ProjectData = {
    policyConf: ProjectPolicyConfig;
    projectFiles: FileMap;
    packageJson: object;
    projectDir: string;
    prevPolicyFiles: Set<string>;
};
