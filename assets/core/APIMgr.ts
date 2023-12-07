import { JsonAsset } from "cc";
import JSEncrypt from "jsencrypt";
import CryptoJS from "crypto-es";
import { WordArray } from "crypto-es/lib/core";
import { GameEvent } from "./GameEvent";


class APIMgr {
    private static _instance: APIMgr;
    static get instance() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new APIMgr();
        return this._instance;
    }

    private BASE_URL = "https://devsession.777invegas.com";
    private PUB_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXwf4TH19EUbMKbUz7Yz3jotnb
osuabFG/lxk8o8M+Uk6na+/7y0a17N4iWXKcmDBFNDdGZ5JsHNKDPogd94lJ1TVw
ps9UiGaeFfAZBIgdJYVekKDOsQQCe/lb189qzACWLXa5KHNM1FrbzSm1BSQpy4xz
e7lATNceaor8kfCt3wIDAQAB
-----END PUBLIC KEY-----`;

    private PRI_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICXwIBAAKBgQDXwf4TH19EUbMKbUz7Yz3jotnbosuabFG/lxk8o8M+Uk6na+/7
y0a17N4iWXKcmDBFNDdGZ5JsHNKDPogd94lJ1TVwps9UiGaeFfAZBIgdJYVekKDO
sQQCe/lb189qzACWLXa5KHNM1FrbzSm1BSQpy4xze7lATNceaor8kfCt3wIDAQAB
AoGBAJhUyA06RinXQQCooQSQUf7pWMWgj/3sYl9R0CinOs9Cj3PXWm29XKRPo5o+
6xOyw8nojuovcArS4rJ1MOdvgMaK53xiLZvhVhbR1UDZlz86U1eEEAJ0VWz4wpBf
yM40e0MSGp1FiXD2iCthpdt6/LpmSQo+RKoLsQUsoForOXf5AkEA96C3oq1/9cFI
CyCBAGmpThhpDiypWR0mOqSxJ2L8SXNV3/ge8uOud/2HwZxZQVFZ+BFlfNzsHbZm
a8v+mnrgMwJBAN8NbpDEFGoA3IYtS8tD4yHw/YvW8zuFJaONz/5jZwoSHp46cw8+
X/KKlexO4iRjg/OeBJagZdHz2ZMVdmoIH6UCQQDu18nH0ukVNTQz50oGB+QRO2I5
FcLR/VeeQLPOdZ85iVFPEZdoV0s02QlUKWW9pqXMq5rj8IKdtgzb9IrCnboZAkEA
2Y5OU2EM0D+62ByCGuZCOa7GfojPgTRi+92sC2GE9OurdYVpCGs8RmMpy+084WU3
JHzx2MDlzxxbEP0UHGOECQJBAIR//rgSH75iQRVINElT++evoZ2Iwri6ZPL4a84N
BfhZUWNOM6WQGMIJ53fwjXkhURECCgMLHOFuSBtkmbfj5tw=
-----END RSA PRIVATE KEY-----`;
    //--mockup data ----------------------------------------------
    public signinRes = {
        statusCode: 0,
        user_id: 210,
        token: "asdasdasda",
        nick_name: null,
        balance: 1000222,
        level: 1,
        last_lineBet: 0,
        authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJraW5kIjoic2Vzc2lvbiIsImlhdCI6MTY5NDA3ODAzNywiZXhwIjoxNjk0MDg1MjM3fQ.HF70sZoZrgSpqL0aDgYsOPKqUanwl4XqMveE6JZdm1A",
        encrypt: "KmaUQzRdfMyg1wKFMmxsXf5UbsUpc77vbsul/h5lB4n/Mborc7IV0cp1MZOMPUEM6XqVaUPvkbjgUd92/1gYtOkolq5J6GKYoSa/A6cOy5Ogyi79u9NAx3nyT7U8O9DGP2Ns4LLVFfrnRN/Jjc6n3917h6lBV1PgMOEFKWNRpRk="
    };
    public keyPass = {
        IV: "1694078037840840",
        PASS: "oIHOXh7QCUPIwMcB8mBnvdNj1gXFOXQL"
    };
    public gamesRes = { 
        statusCode: 0, 
        list: 
        [
            { 
                id: 86, 
                gameName: "cowboy", 
                version: null, 
                tournament: null, 
                multiplier: 0 
            }
        ] 
    };
    public gameInfoRes = {
        statusCode: 0,
        url: "https://slotk0w9ukeg.777invegas.com:8202",
        state: true
    };
    public currentGame = { 
        id: 86, 
        gameName: "cowboy", 
        version: null, 
        tournament: null, 
        multiplier: 0 
    };
    //--end mockup data ----------------------------------------------------------------------
   
    public async doPost(api: string, data: {}, authorization: string = ""): Promise<any> {
        let res = await fetch(`${this.BASE_URL}/${api}`, {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
                "authorization": authorization
            },
            body: JSON.stringify(data),
        });
        return res;
    }
    public async doGet(api: string, authorization: string = ""): Promise<any> {
        let res = await fetch(`${this.BASE_URL}/${api}`, {
            method: "GET", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
                "authorization": authorization
            }
        });
        return res;
    }
    public rsaTest() {
        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(this.PUB_KEY);
        let encrypted = encrypt.encrypt('hello') as string;

        // Decrypt with the private key...
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(this.PRI_KEY);
        const uncrypted = decrypt.decrypt(encrypted);

        // Now a simple check to see if the round-trip worked.
        if (uncrypted == 'hello') {
            console.log('It works!!!');
        }
        else {
            console.log('Something went wrong....');
        }
    }

    async signin() {
        let modulus = btoa(this.PUB_KEY);
        await this.doPost("signin", {
            modulus: modulus,
            exponent: "aaa",
            gameId: 1,
            app: "dev",
            token: "asdasdasda", //no space
            email: "",
            appversion: "1"
        }).then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
                this.signinRes = data;
                let decrypt = new JSEncrypt();
                decrypt.setPrivateKey(this.PRI_KEY);
                let uncrypted = decrypt.decrypt(data.encrypt) as string;
                this.keyPass = JSON.parse(uncrypted);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    public encodeData(data: string) {
        let iv = CryptoJS.enc.Utf8.parse(this.keyPass.IV);
        let key = CryptoJS.enc.Utf8.parse(this.keyPass.PASS);
        let cipherData = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            format: CryptoJS.format.OpenSSL
        });
        let cipherDataB64 = CryptoJS.enc.Base64.stringify(cipherData.ciphertext);
        return cipherDataB64;
    }
    public decodeData(data:string){
        let iv = CryptoJS.enc.Utf8.parse(this.keyPass.IV);
        let key = CryptoJS.enc.Utf8.parse(this.keyPass.PASS);
        let dataDecode = CryptoJS.AES.decrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            format: CryptoJS.format.OpenSSL
        });
        return dataDecode.toString(CryptoJS.enc.Utf8);
    }
    public tokentest() {
        let data = {pid: 'login', token: 'asdasdasd', gameId: 86};
        let cipherDataB64 = this.encodeData(JSON.stringify(data));
        this.doPost("tokentest", {
            t: cipherDataB64
        }, this.signinRes.authorization)
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    async getGames() {
        let api = 'games';
        await this.doGet(api, this.signinRes.authorization)
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
                this.gamesRes = data;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    public getGameInfo(gameId: string) {
        let api = `game/${gameId}`;
        this.doGet(api, this.signinRes.authorization)
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
                GameEvent.DispatchEvent('START_CONNECT',data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    public setCurrentGame(gameName:string){
        this.currentGame = null;
        for(let i=0;i<this.gamesRes.list.length;i++){
            if(this.gamesRes.list[i].gameName.toLowerCase()===gameName.toLowerCase()){
                this.currentGame = this.gamesRes.list[i];
                this.getGameInfo(`${this.currentGame.id}`);
                break;
            }
        }
    }
}

export default APIMgr;