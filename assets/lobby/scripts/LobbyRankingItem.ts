import { _decorator, Component, Node, Label } from 'cc';
import GameMgr from '../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('LobbyRankingItem')
export class LobbyRankingItem extends Component {
    @property({ type: Node })
    icon1st: Node | null = null;
    @property({ type: Node })
    icon2nd: Node | null = null;
    @property({ type: Node })
    icon3rd: Node | null = null;
    @property({ type: Label })
    lbRank: Label | null = null;
    @property({ type: Label })
    lbScore: Label | null = null;
    @property({ type: Label })
    lbUserName: Label | null = null;
    info = {
        "userId": 1145,
        "rank": 1,
        "score": 2560,
        "username": "user_1145"
    }
    setRank(info:any){
        this.info = info;
        this.icon1st.active = false;
        this.icon2nd.active = false;
        this.icon3rd.active = false;
        this.lbRank.node.active = false;
        if(this.info.rank==1){
            this.icon1st.active = true;
        } else if(this.info.rank==2){
            this.icon2nd.active = true;
        } else if(this.info.rank==3){
            this.icon3rd.active = true;
        } else {
            this.lbRank.node.active = true;
            this.lbRank.string = `${this.info.rank}`;
        }
        this.lbScore.string = GameMgr.instance.numberWithCommas(this.info.score);
        this.lbUserName.string = this.info.username;
    }
}

