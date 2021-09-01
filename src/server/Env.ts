import { parse as JSON5Parse } from "JSON5";
import { publishApiFuncs } from "./controller/index.js";
import deepMerge from "deepmerge";
import { readFileSync } from "fs";
import { resolve } from "path";
import express from "express";
import http from "http";
// @ts-ignore
import cors from "cors";
import { emptyEnv, mergeEnv, EnvBase } from "../helpers/index.js";
import { PolicyData, ProjectData } from "../types/index.js";

// @ts-ignore
//import nodeSSPI from "express-node-sspi";

export interface HandlerParams {
    data: any;
    currentDataVersion?: string;
    prevDataVersion?: string;
    newDataVersion?: string;
}

export interface YPolicyApiSettings {
    port: number;
}

export const defaultSettings = (): YPolicyApiSettings => ({
    port: 3300,
});

export interface YPolicyApiEnv<SettingsT extends YPolicyApiSettings = YPolicyApiSettings> {
    settings: SettingsT;
    policies: Map<string, PolicyData>;
    projects: Map<string, ProjectData>;
}

export type YPolicyApiServerEnv = YPolicyApiEnv & EnvBase;

export const startYPolicyApiServer = async (opts?: YPolicyApiSettings): Promise<YPolicyApiServerEnv> => {
    const pthis = { ...emptyEnv(), policies: new Map<string, PolicyData>(), projects: new Map<string, ProjectData>() } as YPolicyApiServerEnv;

    console.log(`CODE00000094`, `Starting ypolicy_api_server...`);
    const settingsPath = resolve("./settings.json");
    console.log(`CODE00000197`, `settingsPath = ${settingsPath}`);

    let settingsFromFile: (YPolicyApiSettings & { default?: boolean }) | undefined;
    try {
        settingsFromFile = JSON5Parse(readFileSync(settingsPath, "utf-8"));
        settingsFromFile!.default = false;
    } catch (e: any) {
        if (e.code !== "ENOENT") {
            console.error(`CODE00000288 Couldn't read '${settingsPath}' because of error\n`, e);
        }
    }

    const settings = deepMerge(deepMerge(defaultSettings(), settingsFromFile || {}), opts || {});

    const env = Object.assign(pthis, {
        settings,
        //        dbProvider,
    } as YPolicyApiServerEnv);

    if (!env.settings.port) throw new Error(`CODE00000183 No port specified!`);

    //    const sspiInstance = nodeSSPI({ retrieveGroups: false });
    const app = express();
    // app.use(cors());
    // app.use(function(req, res, next) {
    //      res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    //      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //      next();
    // });

    if (!process.argv.join(" ").includes("--devuser=")) {
        //        app.use(nodeSSPI({ retrieveGroups: false }));
    } else {
        console.log(`CODE00000291 devuser is set! No SSPI! ${process.argv.join(" ")}`);
    }

    app.use(express.json());

    // app.use(function(req, res, next) {
    //     try {
    //         sspiInstance(req, res, next);
    //     } catch (e) {
    //         console.error(`CODE00000281 sspiInstance error ${sspiInstance.message}`);
    //     }
    //     next();
    // });

    // app.use(function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });

    //    app.use(cors());

    //app.use(express.static("public"));

    console.log(`CODE00000287 Publishing apis:`);
    try {
        for (const publishApi of publishApiFuncs) {
            console.log(`CODE00000289 module ${publishApi.name.split("PublishApi")[0]}`);
            publishApi(env, app);
        }
    } catch (e) {
        console.trace(`CODE00000290 Failed to start server`, e);
    }

    const httpServer = http.createServer(app);

    const httpServerInstance = httpServer.listen(env.settings.port, () => {
        console.log(`CODE00000282`, `Started ypolicy_api_server http://localhost:${env.settings.port}`);
    });

    env.onTerminateCallbacks.push(() => {
        httpServerInstance.close();
    });
    return env;
};
