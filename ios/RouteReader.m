#import <compression.h>
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>
#import "NSData+LAMCompression.h"
#import "RouteReader.h"
#import "Types.pbobjc.h"

@implementation RouteReader
{
  Data * _Nullable dataCache;
}

RCT_EXPORT_MODULE()

- (Data *)getData {
  if (dataCache != nil) {
    return dataCache;
  }

  NSBundle *bundle = [NSBundle bundleForClass:[self class]];
  NSString *file = [bundle pathForResource:@"ttisf989" ofType:@"pr.lzfse"];

  if (file == nil) {
    return nil;
  }

  NSData *compressedData = [NSData dataWithContentsOfFile:[file stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
  NSData *scheduleData = [compressedData lam_uncompressedDataUsingCompression:LAMCompressionLZFSE];

  NSError *error = nil;
  Data *data = [Data parseFromData:scheduleData error:&error];

  if (error != nil) {
    return nil;
  }

  dataCache = data;
  return data;
}

- (NSDictionary *)encodeStop:(Data_Route_Stop *)stop {
  return @{
           @"stationId": @(stop.stationId),
           @"arrival": @(stop.arrival),
           @"departure": @(stop.departure),
           };
}

- (NSDictionary *)encodeRoute:(Data_Route *)route {
  NSMutableArray *stops = [NSMutableArray array];
  [route.stopsArray enumerateObjectsUsingBlock:^(Data_Route_Stop *obj, NSUInteger idx, BOOL *stop) {
    [stops addObject:[self encodeStop:obj]];
  }];
  return @{
           @"id": route.id_p,
           @"stops": stops
           };
}

RCT_EXPORT_METHOD(getData:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  Data *data = [self getData];

  if (data == nil) {
    reject(@"timetable_error", @"Could not load timetable", nil);
    return;
  }

  NSInteger day = [[options valueForKey:@"day"] integerValue];
  NSInteger date = [[options valueForKey:@"date"] integerValue];
  NSInteger startStation = [[options valueForKey:@"startStation"] integerValue];
  NSInteger endStation = [[options valueForKey:@"endStation"] integerValue];
  NSInteger startTime = [[options valueForKey:@"startTime"] integerValue];
  NSInteger endTime = [[options valueForKey:@"endTime"] integerValue];

  NSArray<Data_Route *> *routes = data.routesArray;
  NSInteger routesCount = [routes count];

  NSMutableArray *routesJson = [NSMutableArray array];
  NSMutableSet *addedRouteIds = [NSMutableSet set];
  for (NSInteger routeIndex = 0; routeIndex < routesCount; routeIndex += 1) {
    Data_Route *route = routes[routeIndex];

    if (
        route.days & day &&
        route.from <= date &&
        route.to >= date &&
        ![addedRouteIds containsObject:route.id_p]
    ) {
      [addedRouteIds addObject:route.id_p];

      NSInteger i = 0;
      NSInteger count = route.stopsArray.count;
      for (; i < count; i += 1) {
        Data_Route_Stop *from = route.stopsArray[i];
        NSInteger fromId = from.stationId;
        if (fromId == endStation) {
          break;
        } else if (fromId == startStation) {
          if (
              route.stopsArray[i].departure >= startTime &&
              route.stopsArray[i].departure >= endTime
          ) {
            i += 1;
            for (; i < count; i += 1) {
              Data_Route_Stop *to = route.stopsArray[i];
              NSInteger toId = to.stationId;
              if (toId == endStation) {
                id json = @{
                            @"routeIndex": @(routeIndex),
                            @"departs": @(from.departure),
                            @"arrives": @(to.arrival)
                            };
                [routesJson addObject:json];
              }
            }
          }
        }
      }
    }
  }

  resolve(routesJson);
}

@end
