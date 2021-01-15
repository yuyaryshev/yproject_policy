import { Dirent } from "fs";
import { PolicyData, PolicyFileGenerator } from "./policy";
import { ProjectData } from "./project";

export * from "./policy";

export * from "./project";

export type ReadDirCallback = (path: string, dirEntry: Dirent) => true | false | undefined | void;

export type Match = () => Promise<{ match: string }>;

export type Additional = (path?: string | null) => Promise<{ additional: string }>;

export type PolicyNotFound = () => Promise<{ policyNotFound: string }>;

export type Filter = string;

export type GenFilesMap = Map<string, PolicyFileGenerator>;

export type FileMap = Map<string, string>;

export type FilterCollection = Array<Filter>;

export type PackagesCollection = {
    policies: Map<string, PolicyData>;
    projects: Map<string, ProjectData>;
};
