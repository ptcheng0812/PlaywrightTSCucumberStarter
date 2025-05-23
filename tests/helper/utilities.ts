export function flattenObject(obj: any, prefix = '', result: Record<string, any> = {}): Record<string, any> {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const key = `${prefix}[${index}]`;
      if (item !== null && typeof item === 'object') {
        flattenObject(item, key, result);
      } else {
        result[key] = item;
      }
    });
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const newKey = prefix ? `${prefix}.${key}` : key;
      flattenObject(obj[key], newKey, result);
    }
  } else {
    result[prefix] = obj;
  }

  return result;
}
