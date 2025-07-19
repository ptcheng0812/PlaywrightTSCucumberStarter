import { Serializable } from "child_process";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import { JSONPath } from "jsonpath-plus";
import { CustomWorld } from './world';

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

export function stripLineBreaks(value: any): any {
  if (typeof value === 'string') {
    return value.replace(/[\r\n]+/g, '');
  } else if (Array.isArray(value)) {
    return value.map(stripLineBreaks);
  } else if (value && typeof value === 'object') {
    const result: any = {};
    for (const key in value) {
      result[key] = stripLineBreaks(value[key]);
    }
    return result;
  }
  return value;
}

export function ObjectFieldTakeContextCallbackFunc(
  world: CustomWorld, obj: Serializable, prefix = '',
  func: <T>(world: CustomWorld, key: string, value: T) => void
): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const key = `${prefix}[${index}]`;
      if (item !== null && typeof item === 'object') {
        ObjectFieldTakeContextCallbackFunc(world, item, key, func);
      } else {
        func(world, key, item);
      }
    });
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const newKey = prefix ? `${prefix}.${key}` : key;
      ObjectFieldTakeContextCallbackFunc(world, (obj as any)[key], newKey, func);
    }
  } else {
    func(world, prefix, obj);
  }

}

export function parseIfJsonString(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
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

export function isXmlString(str: string): boolean {
  const result = XMLValidator.validate(str);
  return result === true;
}

export function isFilePath(path: string) {
  // Check if the path ends with a file-like pattern: e.g. .txt, .js, .json
  return /\.[a-zA-Z0-9]+$/.test(path);
}

export function xmlParser(xmlStr: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false, // allow comparison of attributes
    attributeNamePrefix: '@_' // makes attributes easier to identify
  });

  return parser.parse(xmlStr);
}

/**
 * Infers the type of a value (or values) at a given JSONPath and casts input string(s) to that type.
 * Updates the original JSON object with the casted value(s).
 * for amending json / xml
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

export function inferAndCastAndAssignXml(
  xmlString: string,
  path: string,
  input: string | string[]
): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: false,
    parseTagValue: false,
  });
  const builder = new XMLBuilder({ ignoreAttributes: false });

  const jsonObj = parser.parse(xmlString);

  const results = JSONPath({ path, json: jsonObj, resultType: 'all' });

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

  return builder.build(jsonObj);
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
    case 'array':
      try {
        return JSON.parse(input);
      } catch {
        throw new Error(`Cannot cast "${input}" to object`);
      }
    case 'null':
      return null;
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

export function compareXmlStrings(
  xml1: string,
  xml2: string,
  jsonPath: string,
  tolerantKeys: string[] = []
) {
  const obj1 = isXmlString(xml1) ? xmlParser(xml1) : "";
  const obj2 = isXmlString(xml2) ? xmlParser(xml2) : "";

  const extracted1 = JSONPath({ path: jsonPath, json: obj1 });
  const extracted2 = JSONPath({ path: jsonPath, json: obj2 });

  if (!extracted1?.length || !extracted2?.length) {
    throw new Error(`No match found in object 1 or object2 for JSONPath: ${jsonPath}`);
  }

  return compareObj(extracted1[0], extracted2[0], tolerantKeys, jsonPath, []);
}

export function compareJsonAtPath(
  json1: string,
  json2: string,
  jsonPath: string,
  tolerantKeys: string[] = []
): Difference[] {
  const obj1 = JSON.parse(stripLineBreaks(json1));
  const obj2 = JSON.parse(stripLineBreaks(json2));

  const nodes1 = JSONPath({ path: jsonPath, json: obj1 }) ?? [];
  const nodes2 = JSONPath({ path: jsonPath, json: obj2 }) ?? [];

  if (nodes1.length === 0 || nodes2.length === 0) {
    throw new Error(`No match found in object 1 or object 2 for JSONPath: ${jsonPath}`);
  }

  const val1 = nodes1[0];
  const val2 = nodes2[0];

  return compareObj(val1, val2, tolerantKeys, jsonPath, []);
}

function compareObj(
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
        compareObj(obj1[i], obj2[i], tolerantKeys, newPath, differences);
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
        compareObj(val1, val2, tolerantKeys, newPath, differences);
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


export function compareRecordArrays(
  arr1: Record<string, any>[],
  arr2: Record<string, any>[],
  tolerantKeys: string[] = []
): Difference[] {
  const differences: Difference[] = [];

  const maxLength = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < maxLength; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];
    const path = `$[${i}]`;

    if (item1 === undefined) {
      differences.push({ type: 'missing_array_index', path, missingIn: 'obj1' });
    } else if (item2 === undefined) {
      differences.push({ type: 'missing_array_index', path, missingIn: 'obj2' });
    } else {
      compareObj(item1, item2, tolerantKeys, path, differences);
    }
  }

  return differences;
}
