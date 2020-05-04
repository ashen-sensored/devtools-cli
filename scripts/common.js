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

const path = require("path");
const { execSync } = require("child_process");

function getYarnGlobalBinFolder() {
    const binPath = execSync('yarn global bin');
    return binPath.toString().trim();
}

function getUxpSymLinkLocation() {
    const mainScriptFile = path.resolve(__dirname, "../packages/uxp-cli/src/uxp.js");
    const npmBinPath = getYarnGlobalBinFolder();
    if (!npmBinPath) {
        throw new Error("Failed to install the cli scripts in npm bin folder");
    }
    const symPath = path.resolve(npmBinPath, "uxp");
    return {
        mainScriptFile,
        symPath,
    };
}

module.exports = {
    getUxpSymLinkLocation,
    getYarnGlobalBinFolder,
};
