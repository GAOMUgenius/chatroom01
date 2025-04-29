// src/server/server.ts
import * as net from 'net';

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

    private broadcast(content: string) {
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
}

// 启动服务器
new MyTCPServer();