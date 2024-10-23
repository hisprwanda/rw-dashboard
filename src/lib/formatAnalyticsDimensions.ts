
export function formatAnalyticsDimensions(data: any): string[] {
  const result: string[] = [];

  if (data.dx.length > 0) {
    result.push(`dx:${data.dx.join(";")}`);
  }

  if (data.pe.length > 0) {
    result.push(`pe:${data.pe.join(";")}`);
  }



  return result;
}


export function unFormatAnalyticsDimensions(inputArray: any) {
  const result: any = {};

  // Check if inputArray is a valid array
  if (!Array.isArray(inputArray)) {
    return {}; // Return an empty object if input is invalid
  }

  for (const item of inputArray) {
    if (typeof item !== 'string') {
      return {}; // Return empty object if any item is not a string
    }

    const splitItem = item.split(':');

    // Ensure item is correctly formatted as 'key:value'
    if (splitItem.length !== 2) {
      return {}; // Return empty object if any item is improperly formatted
    }

    const [key, value] = splitItem;

    // Ensure value exists
    if (!value) {
      return {}; // Return empty object if any value is missing
    }

    result[key] = value.split(';');
  }

  return result;
}
