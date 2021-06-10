import execa from "execa";

export interface NpmConfig {
    ts: Date;
    values: {
        [key: string]: string;
    };
}

let npmConfig: NpmConfig | undefined;

export async function readNpmConfig(): Promise<void> {
    const ts = new Date();
    const { stdout } = await execa("npm", ["config", "ls", "-l"]);
    if (stdout === "undefined") {
        throw new Error(`CODE00000100 Failed to read npm config.`);
    }
    const lines = stdout.split("\n");
    const values: any = {};
    for (const line of lines) {
        if ([";", "//", ""].includes(line.substr(0, 2).trim())) continue;
        const [k, v0] = line.split(" = ");
        let v;
        try {
            v = JSON.parse(v0);
        } catch (e) {
            v = v0;
        }
        values[k] = v;
    }
    npmConfig = { ts, values };
}

export async function getNpmConfig(): Promise<NpmConfig> {
    await readNpmConfig();
    return npmConfig!;
}

export async function expectNpmConfigKeyString(key: string): Promise<string> {
    const npmConfig = await getNpmConfig();
    const v = npmConfig.values[key];
    if (typeof v === "string") return v;

    if (v === undefined) throw new Error(`CODE00000192 ${key} isn't set. Please use 'npm config set ${key}'.`);

    throw new Error(`CODE00000193 ${key} has unexpected value=${v}, expected a string. Please use 'npm config set ${key}' to set correct value.`);
}
