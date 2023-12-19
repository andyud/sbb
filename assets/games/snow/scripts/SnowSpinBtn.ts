import { _decorator, Component, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SnowSpinBtn')
export class SnowSpinBtn extends Component {
    callback:(val:number)=>void;
    lastTime = -1
    init(cb:(val:number)=>void){
        this.callback = cb;
    }
    start() {
        this.node.on(NodeEventType.TOUCH_START,()=>{
            this.lastTime = new Date().getTime();
        },this);
        this.node.on(NodeEventType.TOUCH_END,()=>{
            this.lastTime = -1;
            this.callback(1);
        },this);
        this.node.on(NodeEventType.TOUCH_CANCEL,()=>{
            if(this.lastTime==-1){
                this.callback(1);
            } else {
                this.lastTime = -1;
                this.callback(0);
            }
        },this);
    }
    update(dt: number) {
        if(this.lastTime>0){
            let cTime = new Date().getTime();
            let dTime = cTime - this.lastTime;
            if(dTime>800){
                this.lastTime = -1;
                this.callback(2);
            }
        }
        
    }
    // destroy():boolean{
    //     this.node.off(NodeEventType.TOUCH_START);
    //     this.node.off(NodeEventType.TOUCH_CANCEL);
    //     this.node.off(NodeEventType.TOUCH_END);
    //     return true;
    // }
}

