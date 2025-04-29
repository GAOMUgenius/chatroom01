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
// src/server/server.ts
const net = __importStar(require("net"));
// 定义服务器类
class MyTCPServer {
    constructor(port = 8080, roomName = '大厅') {
        this.room = {
            roomName,
            port,
            users: []
        };
        this.server = net.createServer(this.serverConnectEvent.bind(this));
        this.initServer();
    }
    initServer() {
        this.server.listen(this.room.port, () => {
            console.log(`服务器已启动，监听端口 ${this.room.port}`);
        });
        this.server.on('close', () => {
            console.log('服务器已关闭');
        });
    }
    serverConnectEvent(client) {
        console.log(`客户端已连接: ${client.remoteAddress}:${client.remotePort}`);
        // 添加客户端到用户列表
        this.room.users.push([`${client.remoteAddress}:${client.remotePort}`, client]);
        client.on('data', (chunk) => {
            const content = chunk.toString();
            this.broadcast(content);
        });
        client.on('end', () => {
            console.log(`客户端已断开连接: ${client.remoteAddress}:${client.remotePort}`);
            this.removeClient(client);
        });
        client.on('error', (err) => {
            console.error(`客户端发生错误: ${err.message}`);
            this.removeClient(client);
        });
    }
    broadcast(content) {
        for (const [_, userClient] of this.room.users) {
            if (userClient.writable) {
                userClient.write(content);
            }
        }
    }
    removeClient(client) {
        const index = this.room.users.findIndex(([_, userClient]) => userClient === client);
        if (index !== -1) {
            this.room.users.splice(index, 1);
        }
    }
}
// 启动服务器
new MyTCPServer();
