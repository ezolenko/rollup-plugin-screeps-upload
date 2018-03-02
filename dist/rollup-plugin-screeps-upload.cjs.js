/* eslint-disable */
'use strict';

var screepsApi = require('screeps-api');
var fs = require('fs');
var path = require('path');
var util = require('util');
var git = require('git-rev-sync');

const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
function catchItLater(p) {
    p.catch(() => { });
    return p;
}
async function upload(configFile, bundleFile) {
    if (configFile === undefined)
        return;
    try {
        readFile(configFile, "utf-8");
        let api;
        const auth = catchItLater(readFile(configFile, "utf-8")
            .then((data) => {
            const config = JSON.parse(data);
            api = new screepsApi.ScreepsAPI(config);
            if (!config.token)
                api.auth();
        }));
        const branch = async () => {
            const url = git.remoteUrl();
            const branch = git.branch();
            return url === undefined || branch === undefined ? "undefined" : `${url.replace(/.*[/]/, "")}-${git.branch()}`;
        };
        const root = path.dirname(bundleFile);
        const jsFiles = catchItLater(readDir(root, "utf-8").then((files) => files.filter((f) => f.endsWith(".js"))));
        const code = {};
        const loadCode = Promise.all((await jsFiles).map(async (e) => {
            const name = await e;
            code[name.replace(/\.js$/i, "")] = await readFile(path.join(root, name), "utf-8");
        }));
        await auth;
        const branches = await api.raw.user.branches().then((data) => data.list.map((b) => b.branch));
        const newBranch = await branch();
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

module.exports = screepsUpload;
//# sourceMappingURL=rollup-plugin-screeps-upload.cjs.js.map
