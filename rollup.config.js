import ts from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";

const pkg = require("./package.json");

export default {
	sourcemap: true,

    input: "./src/rollup-plugin-screeps-upload.ts",
    output:
    [
        { format: "cjs", file: pkg.main },
        { format: "es", file: pkg.jsnext }
    ],

	plugins:
	[
		sourcemaps(),
		ts({ verbosity: 2 }),
		nodeResolve({ jsnext: true, main: true, preferBuiltins: true }),
		commonjs({ ignoreGlobal: true, include: "node_modules/**" }),
	],

    banner: "/* eslint-disable */",

    external: [ "screeps-api", "git-rev-sync", "fs", "path", "util" ]
};
