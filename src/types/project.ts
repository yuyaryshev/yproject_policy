import { FileMap, FilterCollection } from "./index";

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
    files: FileMap;
    packageJson: object;
    location: string;
};
