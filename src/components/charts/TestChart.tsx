import { useMemo } from "react";
import SingleMapItem from "../../pages/Map/components/SingleMapItem";

export function TestChart() {
  const dataGeo = {
      "result": {
          "params": {
              "displayProperty": "NAME",
              "ou": "ou:ImspTQPwCqd;LEVEL-2;"
          },
          "resource": "geoFeatures"
      }
  }

  const mapAnalyticsQueryOneQuery = {
      "myData": {
          "params": {
              "dimension": [
                  "dx:Tt5TAvdfdVK",
                  "ou:ImspTQPwCqd;LEVEL-2;"
              ],
              "displayProperty": "NAME",
              "filter": "pe:2024",
              "skipData": false,
              "skipMeta": true
          },
          "resource": "analytics"
      }
  }

  const mapAnalyticsQueryTwo = {
      "myData": {
          "params": {
              "dimension": [
                  "dx:Tt5TAvdfdVK",
                  "ou:ImspTQPwCqd;LEVEL-2;"
              ],
              "displayProperty": "NAME",
              "filter": "pe:2024",
              "includeMetadataDetails": true,
              "skipData": true,
              "skipMeta": false
          },
          "resource": "analytics"
      }
  }

  return (
      <div>
          <SingleMapItem 
              geoFeaturesQuery={dataGeo} 
              mapAnalyticsQueryOneQuery={mapAnalyticsQueryOneQuery} 
              mapAnalyticsQueryTwo={mapAnalyticsQueryTwo} 
          />
      </div>
  );
}
