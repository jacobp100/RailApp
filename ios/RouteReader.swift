//
//  RouteReader.swift
//  RailApp
//
//  Created by Jacob Parker on 07/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import SwiftFlatBuffers
import DataCompression

@objc(RouteReader)
class RouteReaderImplementation: NSObject {

  var _rootCache: Root? = nil

  var root: Root? {
    if _rootCache == nil, let path = Bundle.main.path(forResource: "ttisf989", ofType: "fb.lzfse"),
      let compressedData = try? Data(contentsOf: URL(fileURLWithPath: path)),
      let data = compressedData.decompress(withAlgorithm: .LZFSE) {
      _rootCache = Root(root: data)
    }

    return _rootCache
  }

  @objc static func moduleName() -> String! {
    return "RouteReader"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func getData(_ options: [String:Any], resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let routes = root?.routes else {
      reject("no_data", "Failed to load data", nil)
      return
    }

    guard let date = options["date"] as? UInt16,
      let dayIndex = options["day"] as? UInt8,
      let startStation = options["startStation"] as? UInt16,
      let endStation = options["endStation"] as? UInt16,
      let startTime = options["startTime"] as? UInt16,
      let endTime = options["endTime"] as? UInt16 else {
      reject("invalid_options", "Failed to decode options", nil)
      return
    }

    let day: UInt8 = 1 << dayIndex

    var visitedRoutes = Set<String>()
    var results: [[String:Any]] = []
    for route in routes.reversed() {
      let validForDate =
        route.dateFrom <= date &&
        route.dateTo >= date &&
        !visitedRoutes.contains(route.routeId!)

      if validForDate {
        visitedRoutes.insert(route.routeId!)
      }

      let validForDay = validForDate && (route.operatingDays & day) != 0

      if validForDay,
        let from = route.stops!.first(where: { $0.stationId == startStation }),
        let to = route.stops!.first(where: { $0.stationId == endStation }),
        from.departureTime < to.arrivalTime,
        from.departureTime >= startTime &&
        from.departureTime <= endTime {
        results.append([
          "routeIndex": -1,
          "routeOrigin": route.stops!.first!.stationId,
          "routeDestination": route.stops!.last!.stationId,
          "departureTime": from.departureTime,
          "arrivalTime": to.arrivalTime,
          "departurePlatform": from.platform ?? "",
          "arrivalPlatform": to.platform ?? "",
        ])
      }
    }

    resolve(results)
  }

}
