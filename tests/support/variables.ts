import { getGlobalContext } from "./contexts";

//TODO: Variable Manager

export function expandVariables(input: string, type: string = "string"): string {
  //Condition: only allow input as string
  //allow an param to control value return type follow origin
  return input.replace(/\{([^{}]+)\}/g, (_, key) => {
    return getGlobalContext(key) ? String(getGlobalContext(key)) : `{${key}}`;
  });
}

export function expandVariablesDeepAsString(input: string): string {
  while (input.includes('{')) {
    const stack: number[] = [];
    let replaced = false;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === '{') {
        stack.push(i);
      } else if (input[i] === '}') {
        const start = stack.pop();
        if (start !== undefined && stack.length === 0) {
          const key = input.slice(start + 1, i);
          const resolved = getGlobalContext(key);
          const value = resolved !== undefined ? JSON.stringify(resolved) : '';
          input = input.slice(0, start) + value + input.slice(i + 1);
          replaced = true;
          break; // Restart after one replacement
        }
      }
    }

    if (!replaced) break;
  }

  return input;
}

export function expandVariablesDeep(
  input: string,
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' = 'string'
): any {
  while (input.includes('{')) {
    const stack: number[] = [];
    let replaced = false;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === '{') {
        stack.push(i);
      } else if (input[i] === '}') {
        const start = stack.pop();
        if (start !== undefined && stack.length === 0) {
          //TODO: need review
          const key = input.slice(start + 1, i);
          const resolved = getGlobalContext(key);
          const value = convertValue(resolved, type);
          input = input.slice(0, start) + (typeof value === 'string' ? value : JSON.stringify(value)) + input.slice(i + 1);
          replaced = true;
          break; // Restart
        }
      }
    }

    if (!replaced) break;
  }

  // Final conversion of whole result
  return convertValue(input, type);
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
