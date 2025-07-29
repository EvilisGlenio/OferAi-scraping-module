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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDataToBackend = sendDataToBackend;
const axios_1 = __importDefault(require("axios"));
const BACKEND_API_URL = "http://localhost:3000";
function sendDataToBackend(item) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`${BACKEND_API_URL}/items`, item);
            console.log(`Item "${item.title}" enviado com sucesso para o backend. Status: ${response.status}`);
        }
        catch (error) {
            console.error(`Erro ao enviar item "${item.title}" para o backend:`, error.message);
            if (error.response) {
                console.error("Detalhes do erro do backend:", error.response.data);
            }
        }
    });
}
