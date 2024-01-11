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
    lbChips: Label | null = null;
    rank:number = 0;
    chips:number = 0;
    setRank(rank:number,chips: number){
        this.rank = rank;
        this.chips = chips;
        this.icon1st.active = false;
        this.icon2nd.active = false;
        this.icon3rd.active = false;
        this.lbRank.node.active = false;
        if(rank==1){
            this.icon1st.active = true;
        } else if(rank==2){
            this.icon2nd.active = true;
        } else if(rank==3){
            this.icon3rd.active = true;
        } else {
            this.lbRank.node.active = true;
            this.lbRank.string = `${this.rank}`;
        }
        this.lbChips.string = GameMgr.instance.numberWithCommas(this.chips);
    }
}

