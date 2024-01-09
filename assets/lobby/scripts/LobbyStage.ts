import { _decorator, Component, Node, Label, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LobbyStage')
export class LobbyStage extends Component {
    @property({type:Node})
    lock: Node | null = null;
    @property({type:Node})
    unlock: Node | null = null;
    @property({type:Node})
    current: Node | null = null;
    @property({type:Label})
    lb1: Label | null = null;
    @property({type:Label})
    lb2: Label | null = null;
    @property({type:CCInteger})
    public gameid:number = 0;
    start() {

    }
    isLock(){
        return this.lock.active;
    }
    isCurrent(){
        return this.current.active;
    }
}

