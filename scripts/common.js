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

function getNodeGlobalBinFolder() {
    try {
        const binPath = execSync("which node");
        const binPathString = binPath.toString().trim();
        return path.dirname(binPathString); // Return the directory containing the node executable
    } catch (error) {
        console.error("Error getting npm global bin folder:", error.message);
        return null;
    }
}

function getUxpGlobalLocation() {
    const mainScriptFile = path.resolve(__dirname, "../packages/uxp-devtools-cli/src/uxp.js");
    const nodeBinPath = getNodeGlobalBinFolder();
    if (!nodeBinPath) {
        throw new Error("Failed to determine the Node.js global bin folder");
    }
    const uxpBinPath = path.resolve(nodeBinPath, "uxp");
    return {
        mainScriptFile,
        uxpBinPath,
    };
}

module.exports = {
    getUxpGlobalLocation,
    getNodeGlobalBinFolder,
};