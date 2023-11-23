import { _decorator, Component, Node } from 'cc';
import APIManager from '../../core/APIManager';
import JSEncrypt from 'jsencrypt';

const { ccclass, property } = _decorator;

@ccclass('sbb')
export class sbb extends Component {
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
}

