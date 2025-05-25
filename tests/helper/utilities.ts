import { Serializable } from "child_process";

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

export function JSONObjectFieldTakeContextCallbackFunc(
  obj: Serializable, prefix = '',
  func: <T>(key: string, value: T) => void
  ): void {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const key = `${prefix}[${index}]`;
        if (item !== null && typeof item === 'object') {
          JSONObjectFieldTakeContextCallbackFunc(item, key, func);
        } else {
          func(key, item);
        }
      });
    } else if (obj !== null && typeof obj === 'object') {
      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const newKey = prefix ? `${prefix}.${key}` : key;
        JSONObjectFieldTakeContextCallbackFunc((obj as any)[key], newKey, func);
      }
    } else {
      func(prefix, obj);
    }

}


export function isJsonString(str: string): boolean {
  try {
    const result = JSON.parse(str);
    // Optional: Ensure it's an object, array, or valid JSON value
    return typeof result === 'object' || typeof result === 'string' ||
      typeof result === 'number' || typeof result === 'boolean' ||
      result === null;
  } catch (e) {
    return false;
  }
}
