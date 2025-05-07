// src/client/client.ts
import * as net from 'net';
import * as readline from 'readline';

// 定义客户端类
class MyTCPClient {
    private client: net.Socket;
    private rl: readline.Interface;

    constructor() {
        this.client = new net.Socket();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.connectToServer();
    }

    private connectToServer() {
        this.client.connect(8080, () => {
            console.log('已连接到服务器');
            this.readInput();
        });
        this.client.on('data', (chunk) => {
            const content = chunk.toString();
            console.log('你接收到了一条消息\n' + content);
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

    private readInput() {
        this.rl.question('请输入消息(输入"exit"断开连接):\n ', (input) => {
            if( input === 'exit') {
                this.client.end();
                this.rl.close();
            } else {
                this.client.write(input, (err) => {
                    if (err) {
                        console.log('发送消息失败');
                    } else {
                        console.log('你发出了一条消息\n' + input);
                    }
                    this.readInput();
                });
            }
        });
    }
}

// 启动客户端
new MyTCPClient();