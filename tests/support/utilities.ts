import { Serializable } from "child_process";
import { JSONPath } from "jsonpath-plus";

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

export function isFilePath(path: string) {
  // Check if the path ends with a file-like pattern: e.g. .txt, .js, .json
  return /\.[a-zA-Z0-9]+$/.test(path);
}


/**
 * Infers the type of a value (or values) at a given JSONPath and casts input string(s) to that type.
 * Updates the original JSON object with the casted value(s).
 *
 * @param json - The target JSON object
 * @param path - JSONPath string (supports wildcards)
 * @param input - Input string or string[] to be cast and assigned
 * @returns Updated JSON object
 */
export function inferAndCastAndAssignJson(json: any, path: string, input: string | string[]): any {
  const results = JSONPath({ path, json, resultType: 'all' });

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No value found at path: ${path}`);
  }

  const inputs = Array.isArray(input) ? input : Array(results.length).fill(input);

  if (inputs.length !== results.length) {
    throw new Error(`Mismatch between result count (${results.length}) and inputs (${inputs.length})`);
  }

  results.forEach((res, index) => {
    const oldValue = res.value;
    const newValue = castToType(inputs[index], typeof oldValue);
    res.parent[res.parentProperty] = newValue;
  });

  return json;
}

export function castToType(input: string, type: string): any {
  switch (type) {
    case 'number':
      const parsed = parseFloat(input);
      if (isNaN(parsed)) throw new Error(`Cannot cast "${input}" to number`);
      return parsed;
    case 'boolean':
      if (input === 'true') return true;
      if (input === 'false') return false;
      throw new Error(`Cannot cast "${input}" to boolean`);
    case 'object':
      try {
        return JSON.parse(input);
      } catch {
        throw new Error(`Cannot cast "${input}" to object`);
      }
    case 'string':
    default:
      return input;
  }
}

export type Difference =
  | {
    type: 'type_mismatch';
    path: string;
    val1: any;
    val2: any;
    type1: string;
    type2: string;
  }
  | {
    type: 'value_mismatch';
    path: string;
    val1: any;
    val2: any;
  }
  | {
    type: 'missing_key';
    path: string;
    key: string;
    missingIn: 'obj1' | 'obj2';
  }
  | {
    type: 'missing_array_index';
    path: string;
    missingIn: 'obj1' | 'obj2';
  };

export function compareJsonAtPath(
  obj1: any,
  obj2: any,
  jsonPath: string,
  tolerantKeys: string[] = []
): Difference[] {
  const nodes1 = JSONPath({ path: jsonPath, json: obj1 }) ?? [];
  const nodes2 = JSONPath({ path: jsonPath, json: obj2 }) ?? [];

  if (nodes1.length === 0 || nodes2.length === 0) {
    return [
      {
        type: 'missing_key',
        path: jsonPath,
        key: jsonPath,
        missingIn: nodes1.length === 0 ? 'obj1' : 'obj2',
      },
    ];
  }

  const val1 = nodes1[0];
  const val2 = nodes2[0];

  return compareJson(val1, val2, tolerantKeys, jsonPath, []);
}

function compareJson(
  obj1: any,
  obj2: any,
  tolerantKeys: string[] = [],
  path: string = '$',
  differences: Difference[] = []
): Difference[] {
  const lastKey = path.split('.').pop() ?? '';
  if (tolerantKeys.includes(lastKey)) {
    return differences;
  }

  if (typeof obj1 !== typeof obj2) {
    differences.push({
      type: 'type_mismatch',
      path,
      val1: obj1,
      val2: obj2,
      type1: typeof obj1,
      type2: typeof obj2,
    });
    return differences;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const newPath = `${path}[${i}]`;
      if (i >= obj1.length) {
        differences.push({ type: 'missing_array_index', path: newPath, missingIn: 'obj1' });
      } else if (i >= obj2.length) {
        differences.push({ type: 'missing_array_index', path: newPath, missingIn: 'obj2' });
      } else {
        compareJson(obj1[i], obj2[i], tolerantKeys, newPath, differences);
      }
    }
  } else if (
    typeof obj1 === 'object' &&
    obj1 !== null &&
    typeof obj2 === 'object' &&
    obj2 !== null
  ) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = `${path}.${key}`;
      if (tolerantKeys.includes(key)) continue;

      const val1 = obj1[key];
      const val2 = obj2[key];

      if (!(key in obj1)) {
        differences.push({ type: 'missing_key', key, path: newPath, missingIn: 'obj1' });
      } else if (!(key in obj2)) {
        differences.push({ type: 'missing_key', key, path: newPath, missingIn: 'obj2' });
      } else {
        compareJson(val1, val2, tolerantKeys, newPath, differences);
      }
    }
  } else if (obj1 !== obj2) {
    differences.push({
      type: 'value_mismatch',
      path,
      val1: obj1,
      val2: obj2,
    });
  }

  return differences;
}
