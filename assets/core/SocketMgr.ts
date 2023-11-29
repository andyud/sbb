import { assert } from "cc";

// imported from socket-io.js
declare var io:any;

class SocketMgr {
    private static _instance: SocketMgr;
    static get instance () {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new SocketMgr();
        return this._instance;
    }

    //--
    private  _wsiSendBinary: WebSocket | null = null;
    constructor(){
        this._wsiSendBinary = null;
    }

    public disconnect(){
        let wsiSendBinary = this._wsiSendBinary;
        if (wsiSendBinary) {
            wsiSendBinary.onopen = null;
            wsiSendBinary.onmessage = null;
            wsiSendBinary.onerror = null;
            wsiSendBinary.onclose = null;
            wsiSendBinary.close();
        }
    }

    public connect (url: string) {
        const self = this;
        this._wsiSendBinary = new WebSocket(url);
        this._wsiSendBinary.binaryType = 'arraybuffer';
        this._wsiSendBinary.onopen = function (evt) {
            console.log('WebSocket: onopen!');
        };

        this._wsiSendBinary.onmessage = function (evt) {
            // const binary = new Uint8Array(evt.data);
            // let binaryStr = 'response bin msg: ';

            // let str = '0x';
            // const hexMap = '0123456789ABCDEF'.split('');
            // assert(hexMap.length == 16);


            // for (let i = 0; i < binary.length; i++) {
            //    str += hexMap[binary[i] >> 4];
            //    str += hexMap[binary[i] & 0x0F];
            // 

            // binaryStr += str;
            // respLabel.string = binaryStr;
            // websocketLabel.string = 'WebSocket: onmessage'
        };

        this._wsiSendBinary.onerror = function (evt) {
           console.log('WebSocket: onerror');
        };

        this._wsiSendBinary.onclose = function (evt) {
            console.log('WebSocket: onclose');
            // After close, it's no longer possible to use it again,
            // if you want to send another request, you need to create a new websocket instance
            self._wsiSendBinary = null;
        };
    }

    sendWebSocketBinary () {
        // let websocketLabel = this.websocket.node.getParent()!.getComponent(Label)!;
        // if (!this._wsiSendBinary) { return; }
        // if (this._wsiSendBinary.readyState === WebSocket.OPEN){
        //     websocketLabel.string = 'WebSocket: sendbinary';
        //     let buf = 'Hello WebSocket中文,\0 I\'m\0 a\0 binary\0 message\0.';

        //     let arrData = new Uint16Array(buf.length);
        //     for (let i = 0; i < buf.length; i++) {
        //         arrData[i] = buf.charCodeAt(i);
        //     }

        //     this._wsiSendBinary.send(arrData.buffer);
        // }
        // else{
        //     let warningStr = 'send binary websocket instance wasn\'t ready...';
        //     websocketLabel.string = 'WebSocket: not ready';
        //     this.websocket.string = warningStr;
        //     this.scheduleOnce(()=> {
        //         this.sendWebSocketBinary();
        //     }, 1);
        // }
    }
}

export default SocketMgr;