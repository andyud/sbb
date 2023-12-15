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

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.cocos.lib.JsbBridge;
import com.cocos.lib.JsbBridgeWrapper;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;
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

public class AppActivity extends CocosActivity {
    //--facebook-
    private CallbackManager callbackManager = null;
    private String myDeviceId = "ababab";
    private GoogleSignInOptions gso = null;
    private GoogleSignInClient mGoogleSignInClient = null;
    private final int GOOGLE_SIGNIN_CODE = 1111;
    private final int FACEBOOK_SIGN_IN_CODE = 2222;
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
        JsbBridge.setCallback(new JsbBridge.ICallback() {
            @Override
            public void onScript(String arg0, String arg1) {
                //TO DO
                if(arg0.equals("get_products")){
                    getProducts();
                }
            }
        });
        JsbBridgeWrapper.getInstance().addScriptEventListener("javascript_to_java", arg ->{
            System.out.print("@JAVA: here is the argument transport in" + arg);
            switch (arg) {
                case "getdeviceid":
                    JsbBridgeWrapper.getInstance().dispatchEventToScript("getdeviceid", this.myDeviceId);
                    break;
                case "getfacebookid":
                    LoginManager.getInstance().logInWithReadPermissions(this,Arrays.asList("gaming_profile"));
                    break;
                case "getgoogleid":
                    mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
                    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                    startActivityForResult(signInIntent, GOOGLE_SIGNIN_CODE);
//                    mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
                    break;
            }
        });
        //--javascript and java communicate --------------------------------------------------------

        //--in app purchase ------------------------------------------------------------------------
        AppActivity self = this;
        billingClient = BillingClient.newBuilder(this)
        .setListener(purchasesUpdatedListener)
        .enablePendingPurchases()
        .build();
        if(billingClient!=null){
            billingClient.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(BillingResult billingResult) {
                    if (billingResult.getResponseCode() ==  BillingClient.BillingResponseCode.OK) {
                        self.isIAPCoonected = true;
                        self.getProducts();
                        System.out.println("IAP: num of products: "+self.products.size());
                    }
                }
                @Override
                public void onBillingServiceDisconnected() {
                    // Try to restart the connection on the next request to
                    // Google Play by calling the startConnection() method.
                    System.out.println("IAP onBillingServiceDisconnected");
                    isIAPCoonected = false;
                }
            });
        }
        //--end in app purchase --------------------------------------------------------------------
        FacebookSdk.fullyInitialize();
        AppEventsLogger.activateApp(this.getApplication());
        callbackManager = CallbackManager.Factory.create();
        LoginManager.getInstance().onActivityResult(FACEBOOK_SIGN_IN_CODE,null);
        LoginManager.getInstance().registerCallback(callbackManager,
                new FacebookCallback<LoginResult>() {
                    @Override
                    public void onSuccess(LoginResult loginResult) {
                        // App code
                        System.out.println("Facebook login success");
                        JsbBridgeWrapper.getInstance().dispatchEventToScript("getfacebookid", "success");
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
        } else if(requestCode == FACEBOOK_SIGN_IN_CODE){
            callbackManager.onActivityResult(requestCode, resultCode, data);
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
//    private List<ProductDetails> products = null;
    public List<String> products = new ArrayList<String>();
    private PurchasesUpdatedListener purchasesUpdatedListener = new PurchasesUpdatedListener() {
        @Override
        public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
            // To be implemented in a later section.
            System.out.println("IAP onPurchasesUpdated");
        }
    };

    public ArrayList<String> getProducts(){
        ArrayList<String> arr = new ArrayList<>();
//        AppActivity self = this;
        // The BillingClient is ready. You can query purchases here.
        QueryProductDetailsParams queryProductDetailsParams =
                QueryProductDetailsParams.newBuilder()
                        .setProductList(
                                ImmutableList.of(
                                        QueryProductDetailsParams.Product.newBuilder()
                                                .setProductId("shop_chips_9.99")
                                                .setProductType(BillingClient.ProductType.SUBS)
                                                .build()))
                        .build();

        billingClient.queryProductDetailsAsync(
                queryProductDetailsParams,
                new ProductDetailsResponseListener() {
                    public void onProductDetailsResponse(BillingResult billingResult,
                                                         List<ProductDetails> productDetailsList) {
                        // check billingResult
                        // process returned productDetailsList
                        System.out.println("IAP billingClient.queryProductDetailsAsyn");
//                        self.products.add("product1");
//                        self.products.add("product2");
                    }
                }
        );
        return arr;
    }
    public void buyProduct(){
        // Launch the billing flow
        /*
        ImmutableList productDetailsParamsList =
                ImmutableList.of(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                                // retrieve a value for "productDetails" by calling queryProductDetailsAsync()
                                .setProductDetails(productDetails)
                                // to get an offer token, call ProductDetails.getSubscriptionOfferDetails()
                                // for a list of offers that are available to the user
                                .setOfferToken(selectedOfferToken)
                                .build()
                );
        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList)
                .build();
        BillingResult billingResult = billingClient.launchBillingFlow(this, billingFlowParams);

         */
    }
    /*in app purchase ------------------------------------------------------------------------------*/
}
