//
//  RailAppBridge.m
//  RailApp
//
//  Created by Jacob Parker on 08/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "RailApp-Bridging-Header.h"

@interface RCT_EXTERN_MODULE(RouteReader, NSObject)
RCT_EXTERN_METHOD(getData:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end
