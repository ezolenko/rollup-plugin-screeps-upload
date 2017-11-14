# rollup-plugin-screeps-upload

Will upload rollup bundle output and all js files nearby to a Screeps server. Based on [node-screeps-api](https://github.com/screepers/node-screeps-api).

Assumes project is in git and has remote repo set, will create branch `[repo name]-[branch-name]` on the server.

### Usage

Add to rollup config:

``` js
import screepsUpload from "./rollup/rollup-plugin-screeps-upload";

export default {
	plugins:
	[
        screepsUpload(),
        // also accepts config file name as a parameter
        // screepsUpload(".screeps.config.json")
        // this overrides cmd line option
	],
};

```

Create configuration file for a server:

```json
{
    "email": "",
    "password": "",
    "protocol": "https",
    "hostname": "screeps.com",
    "port": 443,
    "path": "/"
}
```

Run the build

```
rollup -c rollup.config.js --screeps .screeps.config.json
```

