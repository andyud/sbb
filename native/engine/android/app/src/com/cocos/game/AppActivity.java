/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.cocos.game;

import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.cocos.lib.JsbBridge;
import com.cocos.lib.JsbBridgeWrapper;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;
import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.tasks.Task;
import com.google.common.collect.ImmutableList;
import com.infomark.casinoforest.R;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public class AppActivity extends CocosActivity implements PurchasesUpdatedListener {
    //--facebook-
    private CallbackManager callbackManager = null;
    private String myDeviceId = "ababab";
    private GoogleSignInOptions gso = null;
    private GoogleSignInClient mGoogleSignInClient = null;
    private final int GOOGLE_SIGNIN_CODE = 1111;
    private boolean isFacebookLogin = false;
    private List<String> productLists = new ArrayList<>();//java script send to java
    private int iCurrentGetProductDetail = 0; //current get details
    private List<ProductDetails> productDetailsList = new ArrayList<>();//after get detail store info of products
    private String strProductDetails = "";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);
        this.myDeviceId = Settings.Secure.getString(this.getContentResolver(), Settings.Secure.ANDROID_ID);
        gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();

        //---callback from javascript----------------------------------------------------------------------
        JsbBridgeWrapper.getInstance().addScriptEventListener("javascript_to_java", arg ->{
            System.out.print("@JAVA: here is the argument transport in" + arg);
            switch (arg) {
                case "getdeviceid":
                    JsbBridgeWrapper.getInstance().dispatchEventToScript("getdeviceid", this.myDeviceId);
                    break;
                case "getfacebookid":
                    LoginManager.getInstance().logInWithReadPermissions(this,Arrays.asList("gaming_profile"));
                    isFacebookLogin = true;
                    break;
                case "getgoogleid":
                    mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
                    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                    startActivityForResult(signInIntent, GOOGLE_SIGNIN_CODE);
//                    mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
                    break;
            }
        });
        JsbBridgeWrapper.getInstance().addScriptEventListener("getproductlist", arg -> {
            String[] arr = arg.split("@");
            if(this.productLists.isEmpty()){
                for(int i=0;i<arr.length;i++){
                    this.productLists.add(arr[i]);
                }
                this.strProductDetails = "";//store string for response to cocos creator
                this.iCurrentGetProductDetail = 0;
                this.getProductsDetail();
            }
        });
        JsbBridgeWrapper.getInstance().addScriptEventListener("buyproduct", arg -> {
            this.buyProduct(arg);
        });
        //--javascript and java communicate --------------------------------------------------------

        //--in app purchase ------------------------------------------------------------------------
        AppActivity self = this; //setup google play billing
        billingClient = BillingClient.newBuilder(this)
        .setListener(this)
        .enablePendingPurchases()
        .build();
        if(billingClient!=null){ //connect to account
            billingClient.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(BillingResult billingResult) {
                    if (billingResult.getResponseCode() ==  BillingClient.BillingResponseCode.OK) {
                        self.isIAPCoonected = true;
                    }
                }
                @Override
                public void onBillingServiceDisconnected() {
                    System.out.println("IAP onBillingServiceDisconnected");
                    isIAPCoonected = false;
                }
            });
        }
        //--end in app purchase --------------------------------------------------------------------
        FacebookSdk.fullyInitialize();
        AppEventsLogger.activateApp(this.getApplication());
        callbackManager = CallbackManager.Factory.create();
        LoginManager.getInstance().registerCallback(callbackManager,
                new FacebookCallback<LoginResult>() {
                    @Override
                    public void onSuccess(LoginResult loginResult) {
                        // App code
                        System.out.println("Facebook login success");
                        AccessToken accessToken = AccessToken.getCurrentAccessToken();
                        JsbBridgeWrapper.getInstance().dispatchEventToScript("getfacebookid", accessToken.getUserId());
                    }

                    @Override
                    public void onCancel() {
                        // App code
                        System.out.println("Facebook login cancel");
                        JsbBridgeWrapper.getInstance().dispatchEventToScript("getfacebookid", "cancel");
                    }

                    @Override
                    public void onError(FacebookException exception) {
                        // App code
                        System.out.println("Facebook login error");
                        JsbBridgeWrapper.getInstance().dispatchEventToScript("getfacebookid", "error");
                    }
                });
        //--facebook signin-
    }
    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {

        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == GOOGLE_SIGNIN_CODE) {
            // The Task returned from this call is always completed, no need to attach
            // a listener.
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        } else if(isFacebookLogin){
            callbackManager.onActivityResult(requestCode, resultCode, data);
            isFacebookLogin= false;
        } else {
            SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);
        }
    }
    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            System.out.println("GOOGLE_SIGNIN SUCCESS");
            // Signed in successfully, show authenticated UI.
            JsbBridgeWrapper.getInstance().dispatchEventToScript("getgoogleid", account.getId());

        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w("GOOGLE_SIGNIN", "signInResult:failed code=" + e.getStatusCode());
            JsbBridgeWrapper.getInstance().dispatchEventToScript("getgoogleid", "error");
        }
    }
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }

//    public static String andyGetDeviceId(){
//        if(SDKWrapper.shared().getActivity()!=null){
//            String android_id = Settings.Secure.getString(SDKWrapper.shared().getActivity().getContentResolver(), Settings.Secure.ANDROID_ID);
//            return android_id;
//        } else {
//            return "ababab";
//        }
//    }

    /*in app purchase ------------------------------------------------------------------------------*/
    private BillingClient billingClient = null;
    private boolean isIAPCoonected = false;
    public void getProductsDetail(){
        AppActivity self = this;
        if(this.isIAPCoonected){
            QueryProductDetailsParams queryProductDetailsParams =
                    QueryProductDetailsParams.newBuilder().setProductList(
                                    ImmutableList.of(
                                            QueryProductDetailsParams.Product.newBuilder()
                                                    .setProductId(this.productLists.get(this.iCurrentGetProductDetail))
                                                    .setProductType(BillingClient.ProductType.INAPP)
                                                    .build()))
                            .build();
            billingClient.queryProductDetailsAsync(
                    queryProductDetailsParams,
                    new ProductDetailsResponseListener() {
                        public void onProductDetailsResponse(BillingResult billingResult,
                                                             List<ProductDetails> productDetailsList) {
                            if(self.iCurrentGetProductDetail<self.productLists.size()){
                                for(int i=0;i<productDetailsList.size();i++){
                                    ProductDetails pro = productDetailsList.get(i);
                                    if(self.strProductDetails.length()>0){
                                        self.strProductDetails += "@";
                                    }
                                    self.strProductDetails+=pro.getProductId()+"#"+pro.getName()+"#"+pro.getProductType()+"#"+pro.getDescription();
                                    self.productDetailsList.add(pro);
                                }
                                self.iCurrentGetProductDetail++;
                                if(self.iCurrentGetProductDetail>=self.productLists.size()){
                                    JsbBridgeWrapper.getInstance().dispatchEventToScript("getproductlist", self.strProductDetails);
                                } else {
                                    self.getProductsDetail();
                                }
                            }
                        }
                    }
            );
        }
    }
    public void buyProduct(String productId){
        //--find item
        ProductDetails pro = null;
        AppActivity self = this;
        for(int i=0;i<this.productDetailsList.size();i++){
            if(this.productDetailsList.get(i).getProductId().compareTo(productId)==0){
                pro = this.productDetailsList.get(i);
                break;
            }
        }
        if(pro==null){//purchase failed
            JsbBridgeWrapper.getInstance().dispatchEventToScript("purchaseres", "failed");
            return;
        }
        String offerToken = "";
        if(pro.getSubscriptionOfferDetails()!=null && pro.getSubscriptionOfferDetails().size()>0){
            offerToken = pro.getSubscriptionOfferDetails().get(0).getOfferToken();
        }
        else {
            ProductDetails.OneTimePurchaseOfferDetails offer = pro.getOneTimePurchaseOfferDetails();
            offerToken = offer.zza();
        }
        ImmutableList productDetailsParamsList =
                ImmutableList.of(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                                // retrieve a value for "productDetails" by calling queryProductDetailsAsync()
                                .setProductDetails(pro)
                                // to get an offer token, call ProductDetails.getSubscriptionOfferDetails()
                                // for a list of offers that are available to the user
                                .setOfferToken(offerToken)
                                .build()
                );
        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList)
                .build();
        BillingResult billingResult = billingClient.launchBillingFlow(this, billingFlowParams);
        System.out.println("buyProduct >>> ");
    }

    void handlePurchase(Purchase purchase) {
        // Purchase retrieved from BillingClient#queryPurchasesAsync or your PurchasesUpdatedListener.
//        Purchase purchase = ...;
        System.out.println("handlePurchase done >>> ");
        // Verify the purchase.
        // Ensure entitlement was not already granted for this purchaseToken.
        // Grant entitlement to the user.

        ConsumeParams consumeParams =
                ConsumeParams.newBuilder()
                        .setPurchaseToken(purchase.getPurchaseToken())
                        .build();

        ConsumeResponseListener listener = new ConsumeResponseListener() {
            @Override
            public void onConsumeResponse(BillingResult billingResult, String purchaseToken) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    // Handle the success of the consume operation.
                    System.out.println("onConsumeResponse done >>> ");
                }
            }
        };

        billingClient.consumeAsync(consumeParams, listener);
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> list) {
        if(billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && list != null) {
            for (Purchase purchase : list) {
                handlePurchase(purchase);
            }
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                // Handle an error caused by a user cancelling the purchase flow.
            JsbBridgeWrapper.getInstance().dispatchEventToScript("purchaseres", "failed");

        } else {
            // Handle any other error codes.
            JsbBridgeWrapper.getInstance().dispatchEventToScript("purchaseres", "failed");
        }
    }
    /*in app purchase ------------------------------------------------------------------------------*/
}
