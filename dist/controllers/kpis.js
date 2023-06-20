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
const GetKPIs_1 = require("../GHAFilesAndCharacteristics/GetKPIs");
const getKPIs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let repoNameForKPIs = req.params.repoName;
    let workflowNameForKPIs = req.params.workflowName;
    let load = 'local'; //TODO Anpassen
    let save = false; //TODO Anpassen
    let kpis = yield new GetKPIs_1.GetKPIs(repoNameForKPIs, workflowNameForKPIs, load).getKPIs(save);
    return res.status(200).json({ kpis });
});
exports.default = { getKPIs };
//# sourceMappingURL=kpis.js.map