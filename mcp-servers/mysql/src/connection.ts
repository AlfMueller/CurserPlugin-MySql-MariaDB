import mysql, { type QueryResult } from "mysql2/promise";

type Params = ({} | null)[];

export interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
  connectionLimit?: number;
  connectTimeout?: number;
}

let pool: mysql.Pool | null = null;

export function getConfig(): ConnectionConfig {
  return {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || undefined,
    connectionLimit: parseInt(process.env.MYSQL_POOL_SIZE || "10", 10),
    connectTimeout: parseInt(process.env.MYSQL_CONNECT_TIMEOUT || "10000", 10),
  };
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const cfg = getConfig();
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: cfg.connectionLimit,
      connectTimeout: cfg.connectTimeout,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const [rows] = params
    ? await getPool().execute(sql, params as Params)
    : await getPool().execute(sql);
  return rows as T[];
}

export async function execute(
  sql: string,
  params?: unknown[],
): Promise<mysql.ResultSetHeader> {
  const [result] = params
    ? await getPool().execute(sql, params as Params)
    : await getPool().execute(sql);
  return result as mysql.ResultSetHeader;
}

export async function queryWithDatabase<T = Record<string, unknown>>(
  database: string,
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const conn = await getPool().getConnection();
  try {
    await conn.query(`USE \`${database}\``);
    const [rows] = params
      ? await conn.execute(sql, params as Params)
      : await conn.execute(sql);
    return rows as T[];
  } finally {
    conn.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
