import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { parse as parseCsv } from 'csv-parse/sync';
import { xmlParser } from "./commonUtils";

export interface IDataAdapter {
  toObjectAsync(): Promise<Record<string, any>[]>;
}

export interface IFileExporter {
  export(data: Record<string, any>[]): Promise<any>
}

export class UniversalDataAdapter implements IDataAdapter {
  constructor(private input: unknown) { }

  async toObjectAsync(): Promise<Record<string, any>[]> {
    if (Array.isArray(this.input)) {
      const first = this.input[0];

      // Case: array of objects
      if (typeof first === 'object' && first !== null) {
        return this.input as Record<string, any>[];
      }

      // Case: array of strings
      if (typeof first === 'string') {
        return this.parseStringArray(this.input as string[]);
      }
    }

    if (typeof this.input === 'object' && this.input !== null) {
      return [this.input as Record<string, any>];
    }

    if (typeof this.input === 'string') {
      return this.parseSingleString(this.input);
    }

    throw new Error('Unsupported input type');
  }

  private async parseStringArray(data: string[]): Promise<Record<string, any>[]> {
    const result: Record<string, any>[] = [];
    for (const str of data) {
      const parsed = await this.parseSingleString(str);
      result.push(...parsed);
    }
    return result;
  }

  private async parseSingleString(str: string): Promise<Record<string, any>[]> {
    const trimmed = str.trim();

    // Try JSON
    if (this.isJson(trimmed)) {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    // Try XML
    if (this.isXml(trimmed)) {
      const parsed = xmlParser(trimmed);
      return [this.flattenXml(parsed)];
    }

    // Fallback: Plain string or CSV (placeholder for CSV parser)
    throw new Error('Unsupported string format (CSV/plain not yet implemented)');
  }

  private isJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  private isXml(str: string): boolean {
    return str.startsWith('<') && str.endsWith('>');
  }

  private flattenXml(obj: any): Record<string, any> {
    // Simplified flattening logic
    return this.flattenHelper(obj);
  }

  private flattenHelper(obj: any, parentKey = '', res: any = {}): Record<string, any> {
    for (const key in obj) {
      const prop = obj[key];
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof prop === 'object' && !Array.isArray(prop)) {
        this.flattenHelper(prop, newKey, res);
      } else {
        res[newKey] = Array.isArray(prop) && prop.length === 1 ? prop[0] : prop;
      }
    }
    return res;
  }
}

export class XlsxExporter implements IFileExporter {
  async export(data: Record<string, any>[]): Promise<any> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');

    if (data.length) {
      ws.columns = Object.keys(data[0]).map(k => ({ header: k, key: k }));
      data.forEach(row => ws.addRow(row));
    }

    return await wb.xlsx.writeBuffer();
  }
}

export class CsvExporter implements IFileExporter {
  async export(data: Record<string, any>[]): Promise<string> {
    const parser = new Parser();
    return parser.parse(data);
  }
}

export class ExporterFactory {
  static create(format: 'xlsx' | 'csv') {
    if (format === 'xlsx') return new XlsxExporter();
    if (format === 'csv') return new CsvExporter();
    throw new Error(`Unsupported format: ${format}`);
  }
}

export class FileComparer {
  static async parseXlsx(buffer: Buffer): Promise<Record<string, any>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    const headerRow = sheet.getRow(1);
    const values = headerRow?.values;
    const headers = Array.isArray(values) ? values.slice(1) : [];
    const data: Record<string, any>[] = [];

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const rowData: Record<string, any> = {};
      headers.forEach((h, i) => {
        rowData[h as string] = row.getCell(i + 1).value;
      });
      data.push(rowData);
    });

    return data;
  }

  static parseCsv(content: string): Record<string, any>[] {
    return parseCsv(content, { columns: true, skip_empty_lines: true });
  }

  static diff(
    a: Record<string, any>[],
    b: Record<string, any>[]
  ): { onlyInA: Record<string, any>[]; onlyInB: Record<string, any>[] } {
    const key = (row: Record<string, any>) => JSON.stringify(row);
    const setA = new Set(a.map(key));
    const setB = new Set(b.map(key));

    const onlyInA = a.filter(row => !setB.has(key(row)));
    const onlyInB = b.filter(row => !setA.has(key(row)));

    return { onlyInA, onlyInB };
  }
}

export class FileRepository {
  private records: Record<string, any>[] = [];

  constructor(private input: unknown) { }

  async parseToObject(): Promise<void> {
    const adapter = new UniversalDataAdapter(this.input);
    this.records = await adapter.toObjectAsync();
  }

  async exportTo(format: 'xlsx' | 'csv'): Promise<Buffer | string> {
    const exporter = ExporterFactory.create(format);
    return await exporter.export(this.records);
  }

  static async compare(
    fileA: Buffer | string,
    fileB: Buffer | string,
    format: 'xlsx' | 'csv'
  ) {
    let dataA: Record<string, any>[] = [];
    let dataB: Record<string, any>[] = [];

    if (format === 'xlsx') {
      dataA = await FileComparer.parseXlsx(fileA as Buffer);
      dataB = await FileComparer.parseXlsx(fileB as Buffer);
    } else {
      dataA = FileComparer.parseCsv(fileA as string);
      dataB = FileComparer.parseCsv(fileB as string);
    }

    return FileComparer.diff(dataA, dataB);
  }
}
