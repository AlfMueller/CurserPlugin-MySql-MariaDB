import { z } from "zod";
import { query, queryWithDatabase } from "../connection.js";

export const listDatabasesTool = {
  name: "mysql_list_databases",
  description: "List all databases on the MySQL/MariaDB server",
  inputSchema: z.object({}),
  async execute() {
    const rows = await query<{ Database: string }>("SHOW DATABASES");
    const databases = rows.map((r) => r.Database);
    return { databases };
  },
};

export const listTablesTool = {
  name: "mysql_list_tables",
  description:
    "List all tables in a database. If no database is specified, uses the default database from the connection.",
  inputSchema: z.object({
    database: z.string().optional().describe("Database name (optional if default is set)"),
  }),
  async execute({ database }: { database?: string }) {
    let rows: Record<string, unknown>[];
    if (database) {
      rows = await queryWithDatabase(database, "SHOW TABLES");
    } else {
      rows = await query("SHOW TABLES");
    }
    const tables = rows.map((r) => Object.values(r)[0] as string);
    return { tables };
  },
};

export const describeTableTool = {
  name: "mysql_describe_table",
  description:
    "Show the structure of a table including columns, types, nullability, keys, defaults, and extras",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ table, database }: { table: string; database?: string }) {
    const sql = database
      ? `DESCRIBE \`${database}\`.\`${table}\``
      : `DESCRIBE \`${table}\``;
    const rows = await query(sql);
    return { columns: rows };
  },
};

export const showIndexesTool = {
  name: "mysql_show_indexes",
  description: "Show all indexes for a given table",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ table, database }: { table: string; database?: string }) {
    const sql = database
      ? `SHOW INDEX FROM \`${database}\`.\`${table}\``
      : `SHOW INDEX FROM \`${table}\``;
    const rows = await query(sql);
    return { indexes: rows };
  },
};

export const showCreateTableTool = {
  name: "mysql_show_create_table",
  description:
    "Show the full CREATE TABLE statement for a table, useful for understanding the exact schema definition",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ table, database }: { table: string; database?: string }) {
    const sql = database
      ? `SHOW CREATE TABLE \`${database}\`.\`${table}\``
      : `SHOW CREATE TABLE \`${table}\``;
    const rows = await query(sql);
    const createStatement = rows[0]
      ? ((rows[0] as Record<string, unknown>)["Create Table"] as string)
      : null;
    return { createStatement };
  },
};

export const schemaTools = [
  listDatabasesTool,
  listTablesTool,
  describeTableTool,
  showIndexesTool,
  showCreateTableTool,
];
