"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DownloadGHAFilesAndLogs_1 = require("./GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs");
const GetKPIs_1 = require("./GHAFilesAndCharacteristics/GetKPIs");
const GetWorkflowFile_1 = require("./GHAFilesAndCharacteristics/GetWorkflowFile");
const GHAFileLoader_1 = require("./GHAFilesAndCharacteristics/GHAFileLoader");
var Mode;
(function (Mode) {
    Mode[Mode["Help"] = 0] = "Help";
    Mode[Mode["DownloadGHAFilesAndLogs"] = 1] = "DownloadGHAFilesAndLogs";
    Mode[Mode["GetKPIs"] = 2] = "GetKPIs";
    Mode[Mode["GetWorkflowFile"] = 3] = "GetWorkflowFile";
    Mode[Mode["GHAFileLoader"] = 4] = "GHAFileLoader";
})(Mode || (Mode = {}));
let mode = Mode.Help;
let config;
const { program } = require('commander');
program
    .version('1.0.0');
program.command('download-ghafiles-and-logs')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd) => {
    mode = Mode.DownloadGHAFilesAndLogs;
    config = cmd;
});
program.command('get-kpis')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .option('-l, --load [load]', 'load data via api or locally')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd) => {
    mode = Mode.GetKPIs;
    config = cmd;
});
program.command('get-workflow-file')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd) => {
    mode = Mode.GetWorkflowFile;
    config = cmd;
});
program.command('gha-file-loader')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .action((cmd) => {
    mode = Mode.GHAFileLoader;
    config = cmd;
});
program.on('--help', () => {
    console.log('');
    console.log('For more information, append -h after a command');
});
program.parse(process.argv);
switch (+mode) {
    case Mode.DownloadGHAFilesAndLogs:
        let repoOwner = 'curl';
        if (config.owner) {
            repoOwner = config.owner;
        }
        let repoName = 'curl';
        if (config.name) {
            repoName = config.name;
        }
        let workflowName = '';
        if (config.workflow) {
            workflowName = config.workflow;
        }
        let token = '';
        if (config.token) {
            token = config.token;
        }
        let save;
        save = true;
        new DownloadGHAFilesAndLogs_1.DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, token).downloadFiles(save); //TODO in der Schnittstelle berücksichtigen ob gespeichert werden soll
        break;
    case Mode.GetKPIs:
        let repoNameForKPIs = 'curl';
        if (config.name) {
            repoNameForKPIs = config.name;
        }
        let workflowNameForKPIs = 'CodeQL';
        if (config.workflow) {
            workflowNameForKPIs = config.workflow;
        }
        let load = 'local';
        if (config.load) {
            load = config.load;
        }
        let repoOwnerForKPIs = '';
        if (config.owner) {
            repoOwnerForKPIs = config.owner;
        }
        let tokenForKPIs = '';
        if (config.token) {
            tokenForKPIs = config.token;
        }
        let saveForKPIs = false;
        new GetKPIs_1.GetKPIs(repoNameForKPIs, workflowNameForKPIs, load, repoOwnerForKPIs, tokenForKPIs).getKPIs(false);
        break;
    case Mode.GetWorkflowFile:
        let repoOwnerWF = 'curl';
        if (config.owner) {
            repoOwnerWF = config.owner;
        }
        let repoNameWF = 'curl';
        if (config.name) {
            repoNameWF = config.name;
        }
        let workflowNameWF = 'CodeQL';
        if (config.workflow) {
            workflowNameWF = config.workflow;
        }
        let tokenWF = '';
        if (config.token) {
            tokenWF = config.token;
        }
        let saveWF;
        saveWF = true;
        new GetWorkflowFile_1.GetWorkflowFile(repoOwnerWF, repoNameWF, workflowNameWF, tokenWF).getWorkflowFile(saveWF); //TODO in der Schnittstelle berücksichtigen ob gespeichert werden soll
        break;
    case Mode.GHAFileLoader:
        let repoNameForLoad = 'hibernate-orm';
        if (config.name) {
            repoNameForLoad = config.name;
        }
        let workflowNameForLoad = '';
        if (config.workflow) {
            workflowNameForLoad = config.workflow;
        }
        new GHAFileLoader_1.GHAFileLoader(repoNameForLoad, workflowNameForLoad).loadFiles();
        break;
    default:
        program.outputHelp();
        break;
}
