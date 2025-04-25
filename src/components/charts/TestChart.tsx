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


  function matchAttributes(formData, attributeiIds) {
    const results = [];
    
    // Helper function to normalize strings: lowercase and remove spaces
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');
    
    // Iterate over each key in formData
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const normalizedKey = normalize(key);
        
        // Check each attribute object in attributeiIds
        for (const attr of attributeiIds) {
          // Only check if the attribute object has a name property
          if (attr.name && normalize(attr.name).includes(normalizedKey)) {
            results.push({
              value: formData[key],
              attribute: attr.id
            });
            // Stop checking further if one attribute matches the key
            break;
          }
        }
      }
    }
    
    return results;
  }
  
  // Example usage:
  const formData = {
    disease: "malaria",
    firstName: "Mark"
  };
  
  const attributeiIds = [
    {
      id: "123",
      name: "Disease of hhkjk"
    },
    {
      id: "098",
      name: "first Name aab"
    },
    {
      id: "543",
      name: "gender bcz"
    }
  ];
  
  console.log("hello attribute",matchAttributes(formData, attributeiIds));

  




  return (
      <div>
          {/* <SingleMapItem 
              geoFeaturesQuery={dataGeo} 
              mapAnalyticsQueryOneQuery={mapAnalyticsQueryOneQuery} 
              mapAnalyticsQueryTwo={mapAnalyticsQueryTwo} 
          /> */}
          hello test
      </div>
  );
}
