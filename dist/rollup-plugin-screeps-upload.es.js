/* eslint-disable */
import { ScreepsAPI } from 'screeps-api';
import { readFile, readdir } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';
import { remoteUrl, branch } from 'git-rev-sync';

const readFile$1 = promisify(readFile);
const readDir = promisify(readdir);
function catchItLater(p) {
    p.catch(() => { });
    return p;
}
async function upload(configFile, bundleFile) {
    if (configFile === undefined)
        return;
    try {
        readFile$1(configFile, "utf-8");
        let api;
        const auth = catchItLater(readFile$1(configFile, "utf-8")
            .then((data) => {
            const config = JSON.parse(data);
            api = new ScreepsAPI(config);
            if (!config.token)
                api.auth();
        }));
        const branch$$1 = async () => {
            const url = remoteUrl();
            const branch$$1 = branch();
            return url === undefined || branch$$1 === undefined ? "undefined" : `${url.replace(/.*[/]/, "")}-${branch()}`;
        };
        const root = dirname(bundleFile);
        const jsFiles = catchItLater(readDir(root, "utf-8").then((files) => files.filter((f) => f.endsWith(".js"))));
        const code = {};
        const loadCode = Promise.all((await jsFiles).map(async (e) => {
            const name = await e;
            code[name.replace(/\.js$/i, "")] = await readFile$1(join(root, name), "utf-8");
        }));
        await auth;
        const branches = await api.raw.user.branches().then((data) => data.list.map((b) => b.branch));
        const newBranch = await branch$$1();
        await loadCode;
        console.log(`screeps-upload:\n\thost: ${api.opts.url}\n\tbranch: ${newBranch}\n\tfiles:\n\t\t${Object.keys(code).join("\n\t\t")}`);
        if (branches.includes(newBranch))
            await api.code.set(newBranch, code);
        else
            await api.raw.user.cloneBranch("", newBranch, code);
    }
    catch (err) {
        console.log(`screeps-upload: failed -- ${err.stack}`);
    }
}
function getConfigName() {
    const index = process.argv.indexOf("--screeps");
    if (index > 0)
        return process.argv[index + 1];
    return undefined;
}
function screepsUpload(configFile) {
    return {
        name: "screeps-upload",
        onwrite({ file }) {
            Promise.resolve(upload(configFile === undefined ? getConfigName() : configFile, file));
        },
    };
}

export default screepsUpload;
//# sourceMappingURL=rollup-plugin-screeps-upload.es.js.map
