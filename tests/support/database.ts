import * as dotenv from "dotenv";
dotenv.config();

import { Client as PgClient } from "pg";
import mysql from "mysql2/promise";
import mssql, { ConnectionPool } from "mssql";
import oracledb, { Connection as OracleConnection } from "oracledb";

type DBType = "postgresql" | "mysql" | "mssql" | "oracle";

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private dbType: DBType;
  private connection: any = null;

  private constructor() {
    this.dbType = process.env.DB_TYPE as DBType;
  }

  public static async getInstance(): Promise<DatabaseConnection> {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
      await DatabaseConnection.instance.connect();
    }
    return DatabaseConnection.instance;
  }

  private async connect(): Promise<void> {
    const config = {
      host: process.env.DB_HOST ?? '',
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER ?? '',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? '',
    };

    switch (this.dbType) {
      case "postgresql":
        this.connection = new PgClient(config);
        await this.connection.connect();
        break;

      case "mysql":
        this.connection = await mysql.createConnection(config);
        break;

      case "mssql":
        this.connection = await mssql.connect({
          user: config.user,
          password: config.password,
          server: config.host,
          database: config.database,
          port: config.port,
          options: { encrypt: false, trustServerCertificate: true }
        });
        break;

      case "oracle":
        this.connection = await oracledb.getConnection({
          user: config.user,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database}`
        });
        break;

      default:
        throw new Error(`Unsupported DB type: ${this.dbType}`);
    }
  }

  public async query(sql: string): Promise<Record<string, any>[]> {
    switch (this.dbType) {
      case "postgresql":
        const pgRes = await this.connection.query(sql);
        return Array.isArray(pgRes.rows) ? pgRes.rows : [];

      case "mysql":
        const [rows] = await this.connection.execute(sql);
        return Array.isArray(rows) ? rows as Record<string, any>[] : [];

      case "mssql":
        const result = await this.connection.request().query(sql);
        return Array.isArray(result.recordset) ? result.recordset : [];

      case "oracle":
        const oraRes = await this.connection.execute(sql, [], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        return Array.isArray(oraRes.rows) ? oraRes.rows as Record<string, any>[] : [];

      default:
        throw new Error(`Unsupported DB type: ${this.dbType}`);
    }
  }

  public async close(): Promise<void> {
    if (!this.connection) return;

    switch (this.dbType) {
      case "postgresql":
        await this.connection.end();
        break;

      case "mysql":
        await this.connection.end();
        break;

      case "mssql":
        await this.connection.close();
        break;

      case "oracle":
        await this.connection.close();
        break;
    }

    this.connection = null;
  }
}
