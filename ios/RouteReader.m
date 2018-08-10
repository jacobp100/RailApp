#import "RouteReader.h"
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>

@implementation RouteReader

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getData:(NSString*)uri resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  NSBundle *bundle = [NSBundle bundleForClass:[self class]];
  NSString *file = [bundle pathForResource:@"ttisf989" ofType:@"ui64"];

  if (file == nil) {
    reject(@"no_file", @"No file", nil);
    return;
  }

  NSData *data = [NSData dataWithContentsOfFile:[file stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];

  unsigned long long *bytes = (unsigned long long *)[data bytes];
  NSUInteger length = [data length] / sizeof(bytes);
  int i = 0;
//  while (i < length) {
//    
//  }

  NSDictionary* res = @[
                        @{
                        @"from": @"London Waterloo",
                        @"to": @"Surbiton",
                        @"start": @(300),
                        @"end": @(320),
                        },
                        @{
                          @"from": @"London Waterloo",
                          @"to": @"Surbiton",
                          @"start": @(600),
                          @"end": @(620),
                          }
                        ];

  resolve(res);
}

@end
