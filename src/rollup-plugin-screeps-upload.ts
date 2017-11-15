import { ScreepsAPI } from "screeps-api";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as git from "git-rev-sync";

const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);

function catchItLater<T>(p: Promise<T>)
{
	// https://stackoverflow.com/questions/40920179/should-i-refrain-from-handling-promise-rejection-asynchronously
	p.catch(() => {});
	return p;
}

async function upload(configFile: string | undefined, bundleFile: string)
{
	if (configFile === undefined)
		return;
	try
	{
		const api = new ScreepsAPI();
		const auth = catchItLater(readFile(configFile, "utf-8").then((data) => api.setServer(JSON.parse(data))).then(() => api.auth()));
		const branch = async () =>
		{
			const url = git.remoteUrl();
			const branch = git.branch();
			return url === undefined || branch == undefined ? "undefined" : `${url.replace(/.*[/]/, "")}-${git.branch()}`;
		};

		const root = path.dirname(bundleFile);
		const jsFiles = catchItLater(readDir(root, "utf-8").then((files) => files.filter((f) => (f as string).endsWith(".js"))));

		const code: { [id: string]: string } = {};
		const loadCode = Promise.all((await jsFiles).map(async (e) =>
		{
			const name: string = await e as string;
			code[name.replace(/\.js$/i, "")] = await readFile(path.join(root, name), "utf-8")
		}));

		await auth;
		const branches = await api.raw.user.branches().then((data: any) => data.list.map((b: any) => b.branch));
		const newBranch = await branch();
		await loadCode;

		console.log(`screeps-upload:\n\thost: ${api.opts.url}\n\tbranch: ${newBranch}\n\tfiles:\n\t\t${Object.keys(code).join("\n\t\t")}`);

		if (branches.includes(newBranch))
			await api.code.set(newBranch, code);
		else
			await api.raw.user.cloneBranch("", newBranch, code);
	}
	catch(err)
	{
		console.log(`screeps-upload: failed -- ${err.stack}`);
	}
}

function getConfigName()
{
	const index = process.argv.indexOf("--screeps");
	if (index > 0)
		return process.argv[index + 1];
	return undefined;
}

export interface IRollupBundle
{
	file: string;
}

export default function screepsUpload(configFile?: string)
{
	return {
		name: "screeps-upload",

		onwrite({ file }: IRollupBundle)
		{
			Promise.resolve(upload(configFile === undefined ? getConfigName() : configFile, file));
		},
	};
}