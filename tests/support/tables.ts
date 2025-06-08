import { expandVariablesDeepAsString } from "./variables";

export function hashTableTransformed(inputTable: Record<string, string>[]): Record<string, any>[] {
  //TODO: Sub-Level Transform?

  return inputTable.map((b) => {
    return Object.fromEntries(Object.entries(b).map(([key, value]) => {
      value = expandVariablesDeepAsString(value.trim());

      if (value === "true" || value === "True" || value === "TRUE") return [key, true];
      if (value === "false" || value === "False" || value === "FALSE") return [key, false];

      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        return [key, parsed];
      }

      if (/^null$/i.test(value)) return [key, null];

      try {
        const parsedJson = JSON.parse(value);
        return [key, parsedJson];
      } catch {
        // Ignore JSON parse errors, fall through to return as string
      }


      return [key, value];
    }));
  })
}


export function rowTableTransformed(inputTable: Record<string, string>): Record<string, any> {
  return Object.fromEntries(Object.entries(inputTable).map(([key, value]) => {
    value = expandVariablesDeepAsString(value.trim());

    if (value === "true" || value === "True" || value === "TRUE") return [key, true];
    if (value === "false" || value === "False" || value === "FALSE") return [key, false];

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return [key, parsed];
    }

    if (/^null$/i.test(value)) return [key, null];

    try {
      const parsedJson = JSON.parse(value);
      return [key, parsedJson];
    } catch {
      // Ignore JSON parse errors, fall through to return as string
    }

    return [key, value];
  }));

}
