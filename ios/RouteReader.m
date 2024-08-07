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
  NSString *file = [bundle pathForResource:@"ttisf" ofType:@"pr.lzma"];

  if (file == nil) {
    return nil;
  }

  NSData *compressedData = [NSData dataWithContentsOfFile:file];
//  NSData *scheduleData = [compressedData lam_uncompressedDataUsingCompression:LAMCompressionLZFSE];
  NSData *scheduleData = [compressedData lam_uncompressedDataUsingCompression:LAMCompressionLZMA];

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
           @"arrivalTime": @(stop.arrivalTime),
           @"departureTime": @(stop.departureTime),
           @"platform": stop.platform,
           };
}

- (NSArray<NSDictionary *>*)encodeStops:(NSArray<Data_Route_Stop *>*)stopsArray {
  NSMutableArray *stops = [NSMutableArray arrayWithCapacity:[stopsArray count]];
  [stopsArray enumerateObjectsUsingBlock:^(Data_Route_Stop *obj, NSUInteger idx, BOOL *stop) {
    [stops addObject:[self encodeStop:obj]];
  }];
  return stops;
}

- (NSDictionary *)encodeRoute:(Data_Route *)route {
  return @{
           @"operatingDays": @(route.operatingDays),
           @"dateFrom": @(route.dateFrom),
           @"dateTo": @(route.dateTo),
           @"stops": [self encodeStops:route.stopsArray],
           };
}

RCT_EXPORT_METHOD(preloadData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  [self getData];
  resolve(nil);
}

RCT_EXPORT_METHOD(clearCache:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  dataCache = nil;
  resolve(nil);
}

RCT_EXPORT_METHOD(getData:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  Data *data = [self getData];

  if (data == nil) {
    reject(@"timetable_error", @"Could not load timetable", nil);
    return;
  }

  NSInteger day = 1 << [[options valueForKey:@"day"] integerValue];
  NSInteger date = [[options valueForKey:@"date"] integerValue];
  NSInteger startStation = [[options valueForKey:@"startStation"] integerValue];
  NSInteger endStation = [[options valueForKey:@"endStation"] integerValue];
  NSInteger startTime = [[options valueForKey:@"startTime"] integerValue];
  NSInteger endTime = [[options valueForKey:@"endTime"] integerValue];

  NSArray<Data_Route *> *routes = data.routesArray;
  NSInteger routesCount = [routes count];

  NSMutableArray *routesJson = [NSMutableArray array];
  NSMutableIndexSet *addedRouteIds = [NSMutableIndexSet new];
  for (NSInteger routeIndex = routesCount - 1; routeIndex >= 0; routeIndex -= 1) {
    Data_Route *route = routes[routeIndex];

    BOOL validForDate =
      route.dateFrom <= date &&
      route.dateTo >= date &&
      ![addedRouteIds containsIndex:route.routeId];

    if (validForDate) {
      [addedRouteIds addIndex:route.routeId];
    }

    BOOL validForDay = validForDate && (route.operatingDays & day);

    if (validForDay) {
      NSInteger i = 0;
      NSInteger count = route.stopsArray.count;
      for (; i < count; i += 1) {
        Data_Route_Stop *from = route.stopsArray[i];
        NSInteger fromId = from.stationId;
        if (fromId == endStation) {
          break;
        } else if (fromId == startStation) {
          if (from.departureTime >= startTime && from.departureTime <= endTime) {
            i += 1;
            for (; i < count; i += 1) {
              Data_Route_Stop *to = route.stopsArray[i];
              NSInteger toId = to.stationId;
              if (toId == endStation) {
                id json = @{
                            @"routeIndex": @(routeIndex),
                            @"routeOrigin": @(route.stopsArray.firstObject.stationId),
                            @"routeDestination": @(route.stopsArray.lastObject.stationId),
                            @"departureTime": @(from.departureTime),
                            @"arrivalTime": @(to.arrivalTime),
                            @"departurePlatform": from.platform,
                            @"arrivalPlatform": to.platform,
                            @"stops": [self encodeStops:route.stopsArray],
                            };
                [routesJson addObject:json];
              }
            }
            break;
          }
        }
      }
    }
  }

  resolve(routesJson);
}

RCT_EXPORT_METHOD(getRoute:(NSInteger)index resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  Data *data = [self getData];

  if (data == nil) {
    reject(@"timetable_error", @"Could not load timetable", nil);
    return;
  }

  resolve([self encodeRoute:data.routesArray[index]]);
}

@end
