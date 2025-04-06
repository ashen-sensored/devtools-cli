/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require("path");
const child_process = require("child_process");
const process = require("process");
const { createDeferredPromise } = require("./Common");

function getDevtoolsAppExecutablePath() {
    let uxpDevtoolAppDir =  require.resolve("@adobe/uxp-inspect-frontend/package.json");
    uxpDevtoolAppDir = path.dirname(uxpDevtoolAppDir);

    const productName = "Adobe UXP Developer Tool";
    const baseFolder = path.resolve(uxpDevtoolAppDir, "dist");

    let executablePath = "";
    if (process.platform === "darwin") {
        const platformDirName = process.arch === "arm64" ? "mac-arm64" : "mac";
        executablePath = `${baseFolder}/${platformDirName}/${productName}.app/Contents/MacOS/${productName}`;
    }
    else if (process.platform === "win32") {
        executablePath = `${baseFolder}/win-unpacked/${productName}.exe`;
    }

    return executablePath;
}

function getDevtoolsElectronExecutablePath() {
    let uxpDevtoolAppDir =  require.resolve("@adobe/uxp-inspect-frontend/package.json");
    uxpDevtoolAppDir = path.dirname(uxpDevtoolAppDir);
    const pnpmbinFolder = path.resolve(uxpDevtoolAppDir, "node_modules/.bin")
    
    const executablePath = `${pnpmbinFolder}/electron`;
    return executablePath;
}

function wrapArg(name, arg) {
    return `--${name}=${arg}`;
}

function lauchDevtoolsInspectApp(cdtDebugWsUrl, details) {
    const detailsStr = JSON.stringify(details);
    const escapedDetailsStr = detailsStr.replace(/'/g, "'\\''");
    const a1 = wrapArg("cdtDebugWsUrl", cdtDebugWsUrl);
    const a2 = wrapArg("details", escapedDetailsStr);

    // const args = [ "--inspect-brk=8315",  a1, a2 ];
    const args = [ "./main/index.js", a1, a2 ];

    // print formatted command line for debugging
    const commandLineStr = [getDevtoolsAppExecutablePath(), ...args ].join(" ");
    console.log(`Launching Devtools App with command line: ${commandLineStr}`);

    const child = child_process.execFile(getDevtoolsAppExecutablePath(), args, (err, stdout, stderr) => {
        if (err) {
            throw err;
        }
        console.log(stdout);
        console.log(stderr);
    });

    const deferred = createDeferredPromise();

    child.on("error", (err) => {
        deferred.reject(err);
    });

    child.on("exit", (code, signal) => {
        deferred.resolve({
            code,
            signal
        });
    });

    const handleTerminationSignal = function(signal) {
        process.on(signal, () => {
            if (!child.killed) {
                child.kill(signal);
            }
        });
    };
    handleTerminationSignal("SIGINT");
    handleTerminationSignal("SIGTERM");
    return deferred.promise;
}


function lauchDevtoolsInspectAppDebug(cdtDebugWsUrl, details) {
    const detailsStr = JSON.stringify(details);

    // Escape quotes and spaces in JSON string
    const a1 = `--cdtDebugWsUrl=${cdtDebugWsUrl}`;
    // The single quotes protect the JSON string from shell interpretation
    const a2 = `--details='${detailsStr.replace(/'/g, "'\\''")}'`;
    

    const args = [ "./main/index.js", a1, a2 ];

    // run electron directly instead of the packaged app for debugging
    let uxpDevtoolAppDir =  require.resolve("@adobe/uxp-inspect-frontend/package.json");
    uxpDevtoolAppDir = path.dirname(uxpDevtoolAppDir);
    const electronExecCmdlineStr = [getDevtoolsElectronExecutablePath(), ...args ].join(" ");
    const child = child_process.exec(
        electronExecCmdlineStr,
        {
            cwd: uxpDevtoolAppDir,
        },
        (err, stdout, stderr) => {
            if (err) {
                throw err;
            }
            console.log(stdout);
            console.log(stderr);
        }
    );

    const deferred = createDeferredPromise();

    child.on("error", (err) => {
        deferred.reject(err);
    });

    child.on("exit", (code, signal) => {
        deferred.resolve({
            code,
            signal
        });
    });

    const handleTerminationSignal = function(signal) {
        process.on(signal, () => {
            if (!child.killed) {
                child.kill(signal);
            }
        });
    };
    handleTerminationSignal("SIGINT");
    handleTerminationSignal("SIGTERM");
    return deferred.promise;
}

module.exports = {
    lauchDevtoolsInspectApp,
    lauchDevtoolsInspectAppDebug,
};
