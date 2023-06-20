"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DownloadGHAFilesAndLogs_1 = require("../GHAFilesAndCharacteristics/DownloadGHAFilesAndLogs");
const downloadGHAFilesAndLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let repoName = req.params.repoName;
    let repoOwner = req.params.repoOwner;
    let workflowName = req.params.workflowName;
    let gitHubToken = req.params.gitHubToken;
    yield new DownloadGHAFilesAndLogs_1.DownloadGHAFilesAndLogs(repoOwner, repoName, workflowName, gitHubToken).downloadFiles(false);
    return res.status(200).json({
        message: 'Download complete.'
    });
});
exports.default = { downloadGHAFilesAndLogs };
//# sourceMappingURL=download.js.map