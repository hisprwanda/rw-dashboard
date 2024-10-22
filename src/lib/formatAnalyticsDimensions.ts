
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


export function unFormatAnalyticsDimensions(inputArray:any) {
  const result:any = {};

  inputArray.forEach((item:any) => {
      const [key, value] = item.split(':');
      result[key] = value.split(';');
  });

  return result;
}