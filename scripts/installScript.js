/*
 *  Copyright 2020 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

const fs = require("fs");
const { getUxpSymLinkLocation, getYarnGlobalBinFolder } = require("./common");
/**
 * NOTE: This scripts gets called post install. We will use this create a sym link to 
 * main script file (uxp.js) in the npm global bin folder.
 * This is mainly done to simulate `npm install -g @adobe/uxp` command
 * Given that we don't have this repo published to npm registry yet.
 * Users will directly download the zip of the package and will run `yarn install` on it.
 * This setup will be run as post-install step.
 */

function isYarnBinFolderInPath() {
    const yarnBinPath = getYarnGlobalBinFolder();
    return process.env.PATH.includes(yarnBinPath);
}

function installUxpCliScript() {
    const { mainScriptFile, symPath } = getUxpSymLinkLocation();
    console.log(`Creating sym-link to uxp main script file in global bin folder ${symPath}`);
    fs.chmodSync(mainScriptFile, 0o755);
    if (fs.existsSync(symPath)) {
        fs.unlinkSync(symPath);
    }
    fs.symlinkSync(mainScriptFile, symPath, 'file');

    const isYarnBinInPath = isYarnBinFolderInPath();
    if (!isYarnBinInPath) {
        console.error("Yarn global bin folder is not exported in PATH environment variable. `uxp` command might be not be directly available from the terminal.");
        console.log("Please add the yarn global bin folder to PATH environment variable to access `uxp` command directly from terminal.");
    }
}

installUxpCliScript();
