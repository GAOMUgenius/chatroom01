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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/client/client.ts
const net = __importStar(require("net"));
const readline = __importStar(require("readline"));
// 定义客户端类
class MyTCPClient {
    constructor() {
        this.client = new net.Socket();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.connectToServer();
    }
    connectToServer() {
        this.client.connect(8080, () => {
            console.log('已连接到服务器');
            this.readInput();
        });
        this.client.on('data', (chunk) => {
            const content = chunk.toString();
            console.log(content);
        });
        this.client.on('end', () => {
            console.log('与服务器的连接已断开');
            this.rl.close();
        });
        this.client.on('error', (err) => {
            console.error(`与服务器的连接发生错误: ${err.message}`);
            this.rl.close();
        });
    }
    readInput() {
        this.rl.question('请输入消息(输入"exit"断开连接): ', (input) => {
            if (input === 'exit') {
                this.client.end();
                this.rl.close();
            }
            else {
                this.client.write(input);
                this.readInput();
            }
        });
    }
}
// 启动客户端
new MyTCPClient();
