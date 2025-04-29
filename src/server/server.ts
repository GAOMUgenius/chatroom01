// src/server/server.ts
import * as net from 'net';
import * as readline from 'readline';

// 定义房间类型
type Room = {
    roomName: string;
    port: number;
    users: [string, net.Socket][];
};

// 定义服务器类
class MyTCPServer {
    private server: net.Server;
    private room: Room;

    constructor(port: number = 8080, roomName: string = '大厅') {
        this.room = {
            roomName,
            port,
            users: []
        };
        this.server = net.createServer(this.serverConnectEvent.bind(this));
        this.initServer();
        this.listenForShutdown()
    }

    private initServer() {
        this.server.listen(this.room.port, () => {
            console.log(`服务器已启动，监听端口 ${this.room.port}`);
        });
        this.server.on('close', () => {
            console.log('服务器已关闭');
        });
    }

    private serverConnectEvent(client: net.Socket) {
        console.log(`客户端已连接: ${client.remoteAddress}:${client.remotePort}`);
        //设计用户ID为标识
        const clientId = `${client.remoteAddress}:${client.remotePort}`;
        // 添加客户端到用户列表
        this.room.users.push([`${client.remoteAddress}:${client.remotePort}`, client]);

        client.on('data', (chunk) => {
            const content = chunk.toString();
            if( content === 'kick') {
                this.disconnectClient(client)
            } else {
                this.broadcast( `${clientId}: ${content}`, client)
            }
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

    private broadcast(content: string, sender: net.Socket) {
        for (const [_, userClient] of this.room.users) {
            if (userClient.writable) {
                userClient.write(content);
            }
        }
    }

    private removeClient(client: net.Socket) {
        const index = this.room.users.findIndex(([_, userClient]) => userClient === client);
        if (index !== -1) {
            this.room.users.splice(index, 1);
        }
    }

    //断开客户端连接
    private disconnectClient(client: net.Socket) {
        const clientInfo = `${client.remoteAddress}:${client.remotePort}`;
        console.log(`正在断开客户端连接: ${clientInfo}`);
        client.end();
        this.removeClient(client);
    }

    //关闭服务器
    private listenForShutdown() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('输入 "shutdown" 关闭服务器: ', (input: string) => {
            if (input === 'shutdown') {
                 // 关闭所有客户端连接
                for (const [_, userClient] of this.room.users) {
                    userClient.destroy(); // 强制断开客户端
                }
                //关闭服务器
                this.server.close(() => {
                    console.log('服务器已关闭');
                });
                rl.close();
            } else {
                rl.close();
                this.listenForShutdown();
            }
        });
    }
}

// 启动服务器
new MyTCPServer();