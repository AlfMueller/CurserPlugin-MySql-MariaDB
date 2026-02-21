import { z } from "zod";
import { execute, query } from "../connection.js";

export const insertTool = {
  name: "mysql_insert",
  description: "Insert one or more rows into a table",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    data: z
      .union([z.record(z.unknown()), z.array(z.record(z.unknown()))])
      .describe("Object or array of objects with column:value pairs"),
    database: z.string().optional().describe("Database context (optional)"),
  }),
  async execute({
    table,
    data,
    database,
  }: {
    table: string;
    data: Record<string, unknown> | Record<string, unknown>[];
    database?: string;
  }) {
    const rows = Array.isArray(data) ? data : [data];
    if (rows.length === 0) {
      return { success: false, message: "No data provided" };
    }

    const columns = Object.keys(rows[0]);
    const escapedCols = columns.map((c) => `\`${c}\``).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const qualifiedTable = database
      ? `\`${database}\`.\`${table}\``
      : `\`${table}\``;

    let totalAffected = 0;
    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      const result = await execute(
        `INSERT INTO ${qualifiedTable} (${escapedCols}) VALUES (${placeholders})`,
        values,
      );
      totalAffected += result.affectedRows;
    }

    return {
      success: true,
      affectedRows: totalAffected,
      message: `${totalAffected} row(s) inserted`,
    };
  },
};

export const updateTool = {
  name: "mysql_update",
  description:
    "Update rows in a table. A WHERE clause is REQUIRED to prevent accidental full-table updates.",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    data: z
      .record(z.unknown())
      .describe("Object with column:value pairs to update"),
    where: z.string().describe("WHERE clause (without the WHERE keyword). REQUIRED."),
    params: z
      .array(z.unknown())
      .optional()
      .describe("Parameter values for the WHERE clause placeholders"),
    database: z.string().optional().describe("Database context (optional)"),
  }),
  async execute({
    table,
    data,
    where,
    params,
    database,
  }: {
    table: string;
    data: Record<string, unknown>;
    where: string;
    params?: unknown[];
    database?: string;
  }) {
    if (!where || where.trim().length === 0) {
      throw new Error(
        "WHERE clause is required. Use mysql_query for unrestricted UPDATE statements.",
      );
    }

    const columns = Object.keys(data);
    const setClauses = columns.map((c) => `\`${c}\` = ?`).join(", ");
    const values = columns.map((c) => data[c]);
    const qualifiedTable = database
      ? `\`${database}\`.\`${table}\``
      : `\`${table}\``;

    const allParams = [...values, ...(params || [])];
    const result = await execute(
      `UPDATE ${qualifiedTable} SET ${setClauses} WHERE ${where}`,
      allParams,
    );

    return {
      success: true,
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
      message: `${result.affectedRows} row(s) matched, ${result.changedRows} changed`,
    };
  },
};

export const deleteTool = {
  name: "mysql_delete",
  description:
    "Delete rows from a table. A WHERE clause is REQUIRED to prevent accidental full-table deletion.",
  inputSchema: z.object({
    table: z.string().describe("Table name"),
    where: z.string().describe("WHERE clause (without the WHERE keyword). REQUIRED."),
    params: z
      .array(z.unknown())
      .optional()
      .describe("Parameter values for the WHERE clause placeholders"),
    database: z.string().optional().describe("Database context (optional)"),
    confirm: z
      .boolean()
      .describe("Must be true to confirm deletion"),
  }),
  async execute({
    table,
    where,
    params,
    database,
    confirm,
  }: {
    table: string;
    where: string;
    params?: unknown[];
    database?: string;
    confirm: boolean;
  }) {
    if (!confirm) {
      return {
        success: false,
        message: "Operation aborted. Set confirm=true to proceed with deletion.",
      };
    }
    if (!where || where.trim().length === 0) {
      throw new Error(
        "WHERE clause is required. Use mysql_query for unrestricted DELETE statements.",
      );
    }

    const qualifiedTable = database
      ? `\`${database}\`.\`${table}\``
      : `\`${table}\``;

    const countResult = await query<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM ${qualifiedTable} WHERE ${where}`,
      params,
    );
    const expectedRows = countResult[0]?.cnt ?? 0;

    const result = await execute(
      `DELETE FROM ${qualifiedTable} WHERE ${where}`,
      params,
    );

    return {
      success: true,
      affectedRows: result.affectedRows,
      message: `${result.affectedRows} row(s) deleted (${expectedRows} matched)`,
    };
  },
};

export const dataTools = [insertTool, updateTool, deleteTool];
