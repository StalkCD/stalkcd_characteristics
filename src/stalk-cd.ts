import {DownloadGHAFilesAndLogs} from "./GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs";
import {GetKPIs} from "./GHAFilesAndCharacteristics/GetKPIs";
import {GetWorkflowFile} from "./GHAFilesAndCharacteristics/GetWorkflowFile";
import {GHAFileLoader} from "./GHAFilesAndCharacteristics/GHAFileLoader";
import {AmountWorkflowsAndRunsTest} from "./AmountWorkflowsAndRunsTest";
import {GetReposAndWorkflows} from "./GHAFilesAndCharacteristics/GetReposAndWorkflows";

enum Mode {
    Help,
    DownloadGHAFilesAndLogs,
    GetKPIs,
    GetWorkflowFile,
    GHAFileLoader,
    DownloadGHABillingData,
    AmountWorkflowsAndRunsTest,
    GetReposAndWorkflows
}

let mode: Mode = Mode.Help;
let config: any;

const { program } = require('commander');

program
    .version('1.0.0');

program.command('download-ghafiles-and-logs')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'OPTIONAL workflow of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .option('-d, --depth [depth]', 'OPTIONAL (Default = 3) determine what to download 1:workflow, 2:runs, 3:jobs, 4:logs')
    .option('-s, --savetype [savetype]', 'save data in files or in db')
    .option('-p, --pages [pages]', 'OPTIONAL (Default = 1) number of pages of downloaded runs: numberRuns = pages x 100')
    .action((cmd:String) => {
        mode = Mode.DownloadGHAFilesAndLogs;
        config = cmd;
    })

program.command('get-kpis')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .option('-l, --load [load]', 'load data from db or files')
    .action((cmd:string) => {
        mode = Mode.GetKPIs;
        config = cmd;
    })
program.command('get-workflow-file')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd:String) => {
        mode = Mode.GetWorkflowFile;
        config = cmd;
    })
program.command('gha-file-loader')
    .option('-n, --name [name]', 'name of the repository')
    .option('-w, --workflow [workflow]', 'workflow of the repository')
    .action((cmd:String) => {
        mode = Mode.GHAFileLoader;
        config = cmd;
    })

program.command('download-gha-billing-data')
    .option('-o, --owner [owner]', 'owner of the repository')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd:String) => {
        mode = Mode.DownloadGHABillingData;
        config = cmd;
    })

program.command('amount-test')
    .option('-t, --token [token]', 'token for the github api')
    .action((cmd:String) => {
        mode = Mode.AmountWorkflowsAndRunsTest;
        config = cmd;
    })
program.command('get-repos-and-workflows')
    .action((cmd:String) => {
        mode = Mode.GetReposAndWorkflows;
        config = cmd;
    })

program.on('--help', () => {
    console.log('');
    console.log('For more information, append -h after a command');
    }
)


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
        if(config.workflow) {
            workflowName = config.workflow;
        }
        let token = '';
        if(config.token) {
            token = config.token;
        }
        let saveType: string = '';
        if(config.savetype) {
            saveType = config.savetype;
        }
        let depth: number = 3;
        if(config.depth) {
            depth = config.depth;
        }
        let pages: number = 1;
        if(config.pages) {
            pages = config.pages;
        }
        new DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, token).downloadFiles(saveType, depth, pages);
        break;

    case Mode.GetKPIs:
        let repoNameForKPIs = '';
        if (config.name) {
            repoNameForKPIs = config.name;
        }
        let workflowNameForKPIs = '';
        if(config.workflow) {
            workflowNameForKPIs = config.workflow;
        }
        let load = '';
        if(config.load) {
            load = config.load;
        }
        new GetKPIs(repoNameForKPIs, workflowNameForKPIs).getKPIs(load);
        break;

    case Mode.GetWorkflowFile:
        let repoOwnerWF = '';
        if (config.owner) {
            repoOwnerWF = config.owner;
        }
        let repoNameWF = '';
        if (config.name) {
            repoNameWF = config.name;
        }
        let workflowNameWF = '';
        if(config.workflow) {
            workflowNameWF = config.workflow;
        }
        let tokenWF = '';
        if(config.token) {
            tokenWF = config.token;
        }
        let saveWF : boolean;
        saveWF = true;
        let saveTypeForWF = "db";
        new GetWorkflowFile(repoOwnerWF, repoNameWF, workflowNameWF, tokenWF).getWorkflowFile(saveWF, saveTypeForWF); //TODO in der Schnittstelle berücksichtigen ob gespeichert werden soll
        break;

    case Mode.AmountWorkflowsAndRunsTest:
        let tokenTest: string = config.token;
        new AmountWorkflowsAndRunsTest().calc(tokenTest);
        break;

    case Mode.GetReposAndWorkflows:
        new GetReposAndWorkflows().get();
        break;

    /*
    case Mode.DownloadGHABillingData:
        let repoOwnerBilling = 'curl';
        if (config.owner) {
            repoOwnerBilling = config.owner;
        }
        let tokenBilling = '';
        if(config.token) {
            tokenBilling = config.token;
        }

        let saveBilling : boolean;
        saveBilling = true;
        new DownloadGHABillingData(repoOwnerBilling, tokenBilling).download(saveBilling); //TODO in der Schnittstelle berücksichtigen ob gespeichert werden soll
        break;
     */

    default:
        program.outputHelp();
        break;
}
