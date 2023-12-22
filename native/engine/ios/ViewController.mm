/****************************************************************************
 Copyright (c) 2013 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#import "ViewController.h"
#import "AppDelegate.h"
#import "platform/ios/AppDelegateBridge.h"
#import <StoreKit/StoreKit.h>
#import "platform/apple/JsbBridgeWrapper.h"

namespace {
//    cc::Device::Orientation _lastOrientation;
}

@interface ViewController ()
@end

@implementation ViewController


- (BOOL) shouldAutorotate {
    return YES;
}

//fix not hide status on ios7
- (BOOL)prefersStatusBarHidden {
    return YES;
}

// Controls the application's preferred home indicator auto-hiding when this view controller is shown.
- (BOOL)prefersHomeIndicatorAutoHidden {
    return YES;
}

- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator {
   AppDelegate* delegate = [[UIApplication sharedApplication] delegate];
   [delegate.appDelegateBridge viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
   float pixelRatio = [delegate.appDelegateBridge getPixelRatio];

   //CAMetalLayer is available on ios8.0, ios-simulator13.0.
   CAMetalLayer *layer = (CAMetalLayer *)self.view.layer;
   CGSize tsize             = CGSizeMake(static_cast<int>(size.width * pixelRatio),
                                         static_cast<int>(size.height * pixelRatio));
   layer.drawableSize = tsize;
}

- (void) viewDidLoad {
    productsPrice = [[NSMutableDictionary alloc] init];
    productsPurchased = [[NSMutableArray alloc] init];
}

- (BOOL)canMakePurchases
{
    return [SKPaymentQueue canMakePayments];
}
- (void)fetchAvailableProducts:(NSString *)productId {
    productIdentifiers = [NSSet setWithObjects:productId,nil];
    productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
    productsRequest.delegate = self;
    [productsRequest start];
}

- (void)purchaseMyProduct:(SKProduct*)product{
    
    if ([self canMakePurchases]) {
        currentProductID = product.productIdentifier;
        SKPayment *payment = [SKPayment paymentWithProduct:product];
        [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
        [[SKPaymentQueue defaultQueue] addPayment:payment];
    }
    else{
        //hide loading
        NSLog(@"Purchases are disabled in your device");
    }
}
- (void)purchase:(NSString*)productId {
    SKProductsRequest *productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:[NSSet setWithObject:productId]];
    productsRequest.delegate = self;
    [productsRequest start];
}

-(IBAction)restorePurchase:(id)sender {
    
    //show loading
    [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
}

- (NSString *)getLocalePrice:(SKProduct *)product {
    if (product) {
        NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
        [formatter setFormatterBehavior:NSNumberFormatterBehavior10_4];
        [formatter setNumberStyle:NSNumberFormatterCurrencyStyle];
        [formatter setLocale:product.priceLocale];
        
        return [formatter stringFromNumber:product.price];
    }
    return @"";
}

#pragma mark StoreKit Delegate

- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions {
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
    for (SKPaymentTransaction *transaction in transactions) {
        switch (transaction.transactionState) {
            case SKPaymentTransactionStatePurchasing:
                NSLog(@"Purchasing");
                break;
            case SKPaymentTransactionStatePurchased:
                if ([transaction.payment.productIdentifier isEqualToString:currentProductID]) {
                    
                    NSLog(@"Purchased ");
                    [m dispatchEventToScript:@"purchaseres" arg:@"success"];
//                    if (self.delegate && [self.delegate respondsToSelector:@selector(purchaaseCompleteWithStatus:)]) {
//                        [self.delegate purchaaseCompleteWithStatus:PURCHASE_STATUS_COMPLETED];
//                    }
//                    [APPManager showAlertWithTitle:@"Success" andMessage:@"Purchase is completed succesfully"];
                }
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
                break;
                
            case SKPaymentTransactionStateRestored:
                NSLog(@"Restored ");
                [m dispatchEventToScript:@"purchaseres" arg:@"success"];
//                if (self.delegate && [self.delegate respondsToSelector:@selector(purchaaseCompleteWithStatus:)]) {
//                    [self.delegate purchaaseCompleteWithStatus:PURCHASE_STATUS_RESTORED];
//                }
//                [APPManager showAlertWithTitle:@"Success" andMessage:@"Purchase is restored succesfully"];

                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
                break;
                
            case SKPaymentTransactionStateFailed:
                NSLog(@"Purchase failed ");
                [m dispatchEventToScript:@"purchaseres" arg:@"error"];
//                if (self.delegate && [self.delegate respondsToSelector:@selector(purchaaseCompleteWithStatus:)]) {
//                    [self.delegate purchaaseCompleteWithStatus:PURCHASE_STATUS_FAILED];
//                }
//                [APPManager showAlertWithTitle:@"Failed" andMessage:@"Sorry! Purchase is failed, Please try again later."];
                break;
                
            case SKPaymentTransactionStateDeferred:
                NSLog(@"Purchase Defereed");
                [m dispatchEventToScript:@"purchaseres" arg:@"cancel"];
                break;
                
            default:
                break;
        }
        //hide loading
    }
}

- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
    SKProduct *validProduct = nil;
    int count = (int)[response.products count];
    BOOL isValid = false;
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
    if (count>0) {
        _validProducts = response.products;
        for (validProduct in _validProducts) {
            if(isValid==false){
                for (NSString* productIden in productIdentifiers) {
                    if ([validProduct.productIdentifier isEqualToString:productIden]){
                        NSString *productTitle = [NSString stringWithFormat:
                                                  @"Product Title: %@",validProduct.localizedTitle];
                        NSString *productDes = [NSString stringWithFormat:
                                                @"Product Desc: %@",validProduct.localizedDescription];
                        NSString *productPrice = [self getLocalePrice:validProduct];
                        NSLog(@"Product Info: %@, %@, %@", productTitle, productDes, productPrice);
                        [productsPrice setValue:productPrice forKey:productIden];
                        isValid = true;//da get duoc product can buy
                        [self purchaseMyProduct:validProduct];
                        break;
                    }
                }
            }
        }
    } else {
        NSLog(@"No products to purchase""");
        [m dispatchEventToScript:@"purchaseres" arg:@"error"];
    }
}

@end
