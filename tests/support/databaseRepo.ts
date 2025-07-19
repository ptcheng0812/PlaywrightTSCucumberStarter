import { Client as PgClient } from "pg";
import mysql, { Connection } from "mysql2/promise";
import mssql, { ConnectionPool } from "mssql";
import oracledb, { Connection as OracleConnection } from "oracledb";

export type SQLStatement = {
  query: string;
  values: any[] | Record<string, any>;
};

interface IDatabaseRepository {
  query(sql: string): Promise<Record<string, any>[]>;
  create(tableName: string, row: Record<string, any>): Promise<void>;
  update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void>;
  delete(tableName: string, where: Record<string, any>): Promise<void>;
  close(): Promise<void>;
}

export function buildParameterizedInsertSQL(
  tableName: string,
  row: Record<string, any>,
  dialect: 'pg' | 'mysql' | 'mssql' | 'oracle'
): SQLStatement {
  const columns = Object.keys(row);
  const values = columns.map(col => row[col]);

  let placeholders: string;
  let boundValues: any[] | Record<string, any>;

  switch (dialect) {
    case 'pg':
      placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      boundValues = values;
      break;

    case 'mysql':
      placeholders = values.map(() => `?`).join(', ');
      boundValues = values;
      break;

    case 'mssql':
      placeholders = values.map((_, i) => `@param${i}`).join(', ');
      boundValues = Object.fromEntries(values.map((v, i) => [`param${i}`, v]));
      break;

    case 'oracle':
      placeholders = values.map((_, i) => `:param${i}`).join(', ');
      boundValues = Object.fromEntries(values.map((v, i) => [`param${i}`, v]));
      break;

    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }

  const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

  return { query, values: boundValues };
}

export function buildParameterizedUpdateSQL(
  tableName: string,
  data: Record<string, any>,
  where: Record<string, any>,
  dialect: 'pg' | 'mysql' | 'mssql' | 'oracle'
): SQLStatement {
  const setKeys = Object.keys(data);
  const whereKeys = Object.keys(where);
  const allKeys = [...setKeys, ...whereKeys];

  let query = `UPDATE ${tableName} SET `;
  let placeholders: string[] = [];
  let wherePlaceholders: string[] = [];

  let values: any[] | Record<string, any>;

  switch (dialect) {
    case 'pg':
      placeholders = setKeys.map((key, i) => `${key} = $${i + 1}`);
      wherePlaceholders = whereKeys.map((key, i) => `${key} = $${setKeys.length + i + 1}`);
      query += placeholders.join(', ') + ' WHERE ' + wherePlaceholders.join(' AND ');
      values = [...setKeys.map(k => data[k]), ...whereKeys.map(k => where[k])];
      break;

    case 'mysql':
      placeholders = setKeys.map(() => `?`);
      wherePlaceholders = whereKeys.map(() => `?`);
      query += setKeys.map((k, i) => `${k} = ${placeholders[i]}`).join(', ');
      query += ' WHERE ' + whereKeys.map((k, i) => `${k} = ${wherePlaceholders[i]}`).join(' AND ');
      values = [...setKeys.map(k => data[k]), ...whereKeys.map(k => where[k])];
      break;

    case 'mssql':
    case 'oracle': {
      const prefix = dialect === 'mssql' ? '@' : ':';
      values = {};
      query += setKeys.map((k, i) => `${k} = ${prefix}param${i}`).join(', ');
      query += ' WHERE ' + whereKeys.map((k, i) => `${k} = ${prefix}param${setKeys.length + i}`).join(' AND ');
      allKeys.forEach((key, i) => {
        if (typeof values === 'object' && !Array.isArray(values)) {
          values[`param${i}`] = i < setKeys.length ? data[key] : where[key];
        }
      });
      break;
    }

    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }

  return { query, values };
}

export function buildParameterizedDeleteSQL(
  tableName: string,
  where: Record<string, any>,
  dialect: 'pg' | 'mysql' | 'mssql' | 'oracle'
): SQLStatement {
  const keys = Object.keys(where);
  let query = `DELETE FROM ${tableName} WHERE `;
  let placeholders: string[];
  let values: any[] | Record<string, any>;

  switch (dialect) {
    case 'pg':
      placeholders = keys.map((_, i) => `$${i + 1}`);
      query += keys.map((k, i) => `${k} = ${placeholders[i]}`).join(' AND ');
      values = keys.map(k => where[k]);
      break;

    case 'mysql':
      placeholders = keys.map(() => `?`);
      query += keys.map((k, i) => `${k} = ${placeholders[i]}`).join(' AND ');
      values = keys.map(k => where[k]);
      break;

    case 'mssql':
    case 'oracle': {
      const prefix = dialect === 'mssql' ? '@' : ':';
      values = {};
      query += keys.map((k, i) => `${k} = ${prefix}param${i}`).join(' AND ');
      keys.forEach((k, i) => {
        if (typeof values === 'object' && !Array.isArray(values)) {
          values![`param${i}`] = where[k];
        }
      });
      break;
    }

    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }

  return { query, values };
}


export class PostgresRepository implements IDatabaseRepository {
  private static instance: PostgresRepository;
  private client!: PgClient;
  private isConnected = false;

  private constructor(private config: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }) {
  }

  static async getInstance(config: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }): Promise<PostgresRepository> {
    if (!PostgresRepository.instance) {
      PostgresRepository.instance = new PostgresRepository(config);
      await PostgresRepository.instance.connect();
    }
    return PostgresRepository.instance;
  }

  private async connect() {
    if (!this.isConnected) {
      this.client = new PgClient({
        user: this.config.user,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
      });
      await this.client.connect();
    }
  }

  async query(sql: string): Promise<Record<string, any>[]> {
    const result = await this.client.query(sql);
    return Array.isArray(result.rows) ? result.rows : [];
  }
  async create(tableName: string, row: Record<string, any>): Promise<void> {
    const sql = buildParameterizedInsertSQL(tableName, row, "pg");
    await this.client.query(sql.query, sql.values as any[]);
  }
  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedUpdateSQL(tableName, data, where, "pg");
    await this.client.query(sql.query, sql.values as any[]);
  }
  async delete(tableName: string, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedDeleteSQL(tableName, where, "pg");
    await this.client.query(sql.query, sql.values as any[]);
  }
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
      PostgresRepository.instance = undefined!;
    }
  }
}

export class MySqlRepository implements IDatabaseRepository {
  private static instance: MySqlRepository;
  private connection!: Connection;
  private isConnected = false;

  private constructor(private config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }) {
  }

  static async getInstance(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }): Promise<MySqlRepository> {
    if (!MySqlRepository.instance) {
      MySqlRepository.instance = new MySqlRepository(config);
      await MySqlRepository.instance.connect();
    }
    return MySqlRepository.instance;
  }

  private async connect() {
    if (!this.isConnected) {
      this.connection = await mysql.createConnection(this.config);
      this.isConnected = true;
    }
  }

  async query(sql: string): Promise<Record<string, any>[]> {
    const result = await this.connection.execute(sql);
    return Array.isArray(result) ? result : [];
  }
  async create(tableName: string, row: Record<string, any>): Promise<void> {
    const sql = buildParameterizedInsertSQL(tableName, row, "mysql");
    await this.connection.execute(sql.query, sql.values as any[]);
  }
  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedUpdateSQL(tableName, data, where, "mysql");
    await this.connection.execute(sql.query, sql.values as any[]);
  }
  async delete(tableName: string, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedDeleteSQL(tableName, where, "mysql");
    await this.connection.execute(sql.query, sql.values as any[]);
  }
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.connection.end();
      this.isConnected = false;
      MySqlRepository.instance = undefined!;
    }
  }
}

export class MsSqlServerRepository implements IDatabaseRepository {
  private static instance: MsSqlServerRepository;
  private connection!: ConnectionPool;
  private isConnected = false;

  private constructor(private config: {
    user: string;
    password: string;
    server: string;
    database: string;
    port: number;
    options?: {
      encrypt?: boolean;
      trustServerCertificate?: boolean;
    };
  }) {
  }

  static async getInstance(config: {
    user: string;
    password: string;
    server: string;
    database: string;
    port: number;
    options?: {
      encrypt?: boolean;
      trustServerCertificate?: boolean;
    };
  }): Promise<MsSqlServerRepository> {
    if (!MsSqlServerRepository.instance) {
      MsSqlServerRepository.instance = new MsSqlServerRepository(config);
      await MsSqlServerRepository.instance.connect();
    }
    return MsSqlServerRepository.instance;
  }

  private async connect() {
    if (!this.isConnected) {
      this.connection = await mssql.connect(this.config);
      this.isConnected = true;
    }
  }

  async query(sql: string): Promise<Record<string, any>[]> {
    const result = await this.connection.request().query(sql);
    return Array.isArray(result.recordsets) ? result.recordsets : [];
  }
  async create(tableName: string, row: Record<string, any>): Promise<void> {
    const sql = buildParameterizedInsertSQL(tableName, row, "mssql");
    const request = this.connection.request();
    if (sql.values && typeof sql.values === 'object' && !Array.isArray(sql.values)) {
      for (const [key, value] of Object.entries(sql.values)) {
        request.input(key, value);
      }
    } else if (Array.isArray(sql.values)) {
      sql.values.forEach((val, i) => {
        request.input(`param${i}`, val);
      });
    }

    await request.query(sql.query);
  }
  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedUpdateSQL(tableName, data, where, "mssql");
    const request = this.connection.request();
    if (sql.values && typeof sql.values === 'object' && !Array.isArray(sql.values)) {
      for (const [key, value] of Object.entries(sql.values)) {
        request.input(key, value);
      }
    } else if (Array.isArray(sql.values)) {
      sql.values.forEach((val, i) => {
        request.input(`param${i}`, val);
      });
    }

    await request.query(sql.query);
  }
  async delete(tableName: string, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedDeleteSQL(tableName, where, "mssql");
    const request = this.connection.request();
    if (sql.values && typeof sql.values === 'object' && !Array.isArray(sql.values)) {
      for (const [key, value] of Object.entries(sql.values)) {
        request.input(key, value);
      }
    } else if (Array.isArray(sql.values)) {
      sql.values.forEach((val, i) => {
        request.input(`param${i}`, val);
      });
    }

    await request.query(sql.query);
  }
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.connection.close();
      this.isConnected = false;
      MsSqlServerRepository.instance = undefined!;
    }
  }
}

export class OracleServerRepository implements IDatabaseRepository {
  private static instance: OracleServerRepository;
  private connection!: oracledb.Connection;
  private isConnected = false;

  private constructor(private config: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string; // Service name or SID
  }) {
  }

  public static async getInstance(config: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }): Promise<OracleServerRepository> {
    if (!OracleServerRepository.instance) {
      OracleServerRepository.instance = new OracleServerRepository(config);
      await OracleServerRepository.instance.connect();
    }
    return OracleServerRepository.instance;
  }

  private async connect() {
    if (!this.isConnected) {
      this.connection = await oracledb.getConnection(this.config);
      this.isConnected = true;
    }
  }

  async query(sql: string): Promise<Record<string, any>[]> {
    const result = await this.connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return Array.isArray(result.rows) ? result.rows as Record<string, any>[] : [];
  }
  async create(tableName: string, row: Record<string, any>): Promise<void> {
    const sql = buildParameterizedInsertSQL(tableName, row, "oracle");
    await this.connection.execute(sql.query, sql.values ?? {}, { autoCommit: true });
  }
  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedUpdateSQL(tableName, data, where, "oracle");
    await this.connection.execute(sql.query, sql.values ?? {}, { autoCommit: true });
  }
  async delete(tableName: string, where: Record<string, any>): Promise<void> {
    const sql = buildParameterizedDeleteSQL(tableName, where, "oracle");
    await this.connection.execute(sql.query, sql.values ?? {}, { autoCommit: true });
  }
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.connection.close();
      this.isConnected = false;
      OracleServerRepository.instance = undefined!;
    }
  }
}

export class DatabaseRepositoryFactory {
  static async getRepository(): Promise<IDatabaseRepository> {
    const dbType = process.env.DB_TYPE;

    const config = {
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT!),
      user: process.env.DB_USER!,
      password: process.env.DB_PASS!,
      database: process.env.DB_NAME!,
    };

    switch (dbType) {
      case 'postgresql':
        return await PostgresRepository.getInstance(config);
      case 'mysql':
        return MySqlRepository.getInstance(config);
      case 'mssql':
        const mssqlConfig = {
          user: config.user,
          password: config.password,
          server: config.host,
          database: config.database,
          port: config.port,
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        return MsSqlServerRepository.getInstance(mssqlConfig);
      case 'oracle':
        return OracleServerRepository.getInstance(config);
      default:
        throw new Error(`Unsupported DB_TYPE: ${dbType}`);
    }
  }
}
