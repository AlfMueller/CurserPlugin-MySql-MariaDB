import { z } from "zod";
import { execute, query } from "../connection.js";

export const createTableTool = {
  name: "mysql_create_table",
  description:
    "Create a new table. Provide the full CREATE TABLE SQL statement.",
  inputSchema: z.object({
    sql: z
      .string()
      .describe("Full CREATE TABLE SQL statement"),
    database: z.string().optional().describe("Database to create the table in (optional)"),
  }),
  async execute({ sql, database }: { sql: string; database?: string }) {
    const upperSql = sql.trim().toUpperCase();
    if (!upperSql.startsWith("CREATE TABLE") && !upperSql.startsWith("CREATE TEMPORARY TABLE")) {
      throw new Error("SQL must be a CREATE TABLE statement");
    }

    if (database) {
      await execute(`USE \`${database}\``);
    }
    await execute(sql);
    return { success: true, message: "Table created successfully" };
  },
};

export const alterTableTool = {
  name: "mysql_alter_table",
  description:
    "Alter an existing table. Provide the full ALTER TABLE SQL statement.",
  inputSchema: z.object({
    sql: z
      .string()
      .describe("Full ALTER TABLE SQL statement"),
    database: z.string().optional().describe("Database context (optional)"),
  }),
  async execute({ sql, database }: { sql: string; database?: string }) {
    const upperSql = sql.trim().toUpperCase();
    if (!upperSql.startsWith("ALTER TABLE")) {
      throw new Error("SQL must be an ALTER TABLE statement");
    }

    if (database) {
      await execute(`USE \`${database}\``);
    }
    await execute(sql);
    return { success: true, message: "Table altered successfully" };
  },
};

export const dropTableTool = {
  name: "mysql_drop_table",
  description:
    "Drop a table. DESTRUCTIVE OPERATION — requires explicit confirmation. The confirm parameter must be set to true.",
  inputSchema: z.object({
    table: z.string().describe("Table name to drop"),
    database: z.string().optional().describe("Database context (optional)"),
    confirm: z
      .boolean()
      .describe("Must be true to confirm this destructive operation"),
  }),
  async execute({
    table,
    database,
    confirm,
  }: {
    table: string;
    database?: string;
    confirm: boolean;
  }) {
    if (!confirm) {
      return {
        success: false,
        message:
          "Operation aborted. Set confirm=true to drop the table. This action is irreversible.",
      };
    }

    const qualifiedTable = database
      ? `\`${database}\`.\`${table}\``
      : `\`${table}\``;

    const existing = await query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = ? ${database ? "AND TABLE_SCHEMA = ?" : ""}`,
      database ? [table, database] : [table],
    );
    if (existing.length === 0) {
      return { success: false, message: `Table '${table}' does not exist` };
    }

    await execute(`DROP TABLE ${qualifiedTable}`);
    return { success: true, message: `Table '${table}' dropped successfully` };
  },
};

export const mutateTools = [createTableTool, alterTableTool, dropTableTool];
