"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.GetWorkflowFile = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const GHAFileSaver_1 = require("./GHAFileSaver");
const GITHUB_API_VERSION = 'application/vnd.github.v3+json';
class GetWorkflowFile {
    constructor(repoOwner, repoName, workflowName, token) {
        this.repoName = repoName;
        this.repoOwner = repoOwner;
        this.workflowName = workflowName;
        this.token = token;
    }
    getWorkflowFile(save) {
        return __awaiter(this, void 0, void 0, function* () {
            let workflowLC = this.workflowName.toLowerCase();
            const path = ".github/workflows/" + workflowLC + ".yml";
            const fileContentsResponse = yield this.tryFetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${path}`);
            const fileContentsJson = yield fileContentsResponse.json();
            const fileContents = JSON.stringify(fileContentsJson);
            const url = fileContentsJson.download_url;
            const yamlContentsResponse = yield this.tryFetch(url);
            const yamlContents = yield yamlContentsResponse.text();
            if (save) {
                let saver = new GHAFileSaver_1.GHAFileSaver();
                saver.createTargetDir("GHAWorkflowFiles");
                saver.createTargetDir("GHAWorkflowFiles/" + this.repoName);
                saver.createTargetDir("GHAWorkflowFiles/" + this.repoName + "/" + this.workflowName);
                let path = "GHAWorkflowFiles/" + this.repoName + "/" + this.workflowName;
                saver.fileWriter(path + "/" + this.workflowName, yamlContents, ".yml");
            }
            return yamlContents;
        });
    }
    /**
     * Downloads a file with a given url of a repository.
     * @param fetchUrl the url to be downloaded
     * @private
     */
    tryFetch(fetchUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchParams = {
                headers: {
                    'Accept': GITHUB_API_VERSION,
                    'Authorization': 'token ' + this.token,
                    'User-Agent': 'request',
                    'charset': 'UTF-8'
                },
            };
            let url = fetchUrl;
            let res = new node_fetch_1.Response();
            try {
                res = yield (0, node_fetch_1.default)(url, fetchParams);
            }
            catch (err) {
                console.error(err);
            }
            console.log("request successful: " + url);
            return res;
        });
    }
}
exports.GetWorkflowFile = GetWorkflowFile;
//# sourceMappingURL=GetWorkflowFile.js.map