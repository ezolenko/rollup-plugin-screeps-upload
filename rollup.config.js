import ts from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";

const pkg = require("./package.json");

export default {
    input: "./src/rollup-plugin-screeps-upload.ts",
    output:
    [
        { format: "cjs", file: pkg.main, banner: "/* eslint-disable */", sourcemap: true },
        { format: "es", file: pkg.jsnext, banner: "/* eslint-disable */", sourcemap: true }
    ],

	plugins:
	[
		sourcemaps(),
		ts({ verbosity: 2 }),
		nodeResolve({ jsnext: true, main: true, preferBuiltins: true }),
		commonjs({ ignoreGlobal: true, include: "node_modules/**" }),
	],

    external: [ "screeps-api", "git-rev-sync", "fs", "path", "util" ]
};
