import { parseIfJsonString } from "./commonUtils";
import { getGlobalContext } from "./contexts";
import { CustomWorld } from "./world";


export function expandVariables(world: CustomWorld, input: string, type: string = "string"): string {
  //Condition: only allow input as string
  //allow an param to control value return type follow origin
  // return input.replace(/\{([^{}]+)\}/g, (_, key) => {
  //   return getGlobalContext(world, key) ? String(getGlobalContext(world, key)) : `{${key}}`;
  // });
  const variableRegex = /\{([^{}]+)\}/g;

  let previous: string;

  do {
    previous = input;
    input = input.replace(variableRegex, (_, key) => {
      const value = getGlobalContext(world, key);
      return value !== undefined ? String(value) : `{${key}}`;
    });
  } while (input.includes('{') && input !== previous); // stop if nothing changed

  return input;
}


export function convertValue(value: any, type: 'string' | 'number' | 'boolean' | 'array' | 'object' = "string"): any {
  if (value === undefined || value === null) return '';

  try {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === true || value === 'true';
      case 'array':
        return Array.isArray(value) ? value : JSON.parse(value);
      case 'object':
        return typeof value === 'object' ? value : JSON.parse(value);
      case null:
        return null;
      case 'string':
      default:
        return String(value);
    }
  } catch {
    return value;
  }
}
