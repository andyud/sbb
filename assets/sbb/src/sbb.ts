import { _decorator, Component, EditBox, Label, Node } from 'cc';
import APIMgr from '../../core/APIMgr';
import JSEncrypt from 'jsencrypt';

const { ccclass, property } = _decorator;

@ccclass('sbb')
export class sbb extends Component {
@property({type:Node})
public txtGameId:Node | null = null;
@property({type:Node})
public lbStatus:Node | null = null;
    start() {

    }

    update(deltaTime: number) {
        
    }

    async onSignin(event: Event, customEventData: string){
        await APIMgr.instance.signin();
        this.lbStatus.getComponent(Label).string = JSON.stringify(APIMgr.instance.signinRes);
    }

    onRSATest(event: Event, customEventData: string){
        APIMgr.instance.rsaTest();
    }

    onTokenTest(event: Event, customEventData: string){
        APIMgr.instance.tokentest();
    }

    onGetGameInfo(event: Event, customEventData: string){
        APIMgr.instance.getGames();
    }

    onGetGameDetail(event: Event, customEventData: string){
        let gameId = this.txtGameId.getComponent(EditBox).string;
        APIMgr.instance.getGameInfo(gameId);
    }
}

