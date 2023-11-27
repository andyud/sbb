import { _decorator, Component, EditBox, Node } from 'cc';
import APIManager from '../../core/APIManager';
import JSEncrypt from 'jsencrypt';

const { ccclass, property } = _decorator;

@ccclass('sbb')
export class sbb extends Component {
@property({type:Node})
public txtGameId:Node | null = null;
    start() {

    }

    update(deltaTime: number) {
        
    }

    onSignin(event: Event, customEventData: string){
        // const node = event.target;
        APIManager.instance.signin();
    }

    onRSATest(event: Event, customEventData: string){
        APIManager.instance.rsaTest();
    }

    onTokenTest(event: Event, customEventData: string){
        APIManager.instance.tokentest();
    }

    onGetGameInfo(event: Event, customEventData: string){
        APIManager.instance.getGameInfo();
    }

    onGetGameDetail(event: Event, customEventData: string){
        let gameId = this.txtGameId.getComponent(EditBox).string;
        APIManager.instance.getGameDetail(gameId);
    }
}

