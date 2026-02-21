import { z } from "zod";
import { query as dbQuery, queryWithDatabase } from "../connection.js";

const MAX_ROWS = 1000;

export const queryTool = {
  name: "mysql_query",
  description:
    "Execute an arbitrary SQL query. Returns up to 1000 rows. Use for SELECT, SHOW, and other read operations. For INSERT/UPDATE/DELETE use the dedicated tools.",
  inputSchema: z.object({
    sql: z.string().describe("The SQL query to execute"),
    params: z
      .array(z.unknown())
      .optional()
      .describe("Parameterized query values (for prepared statements)"),
    database: z.string().optional().describe("Database to run the query against (optional)"),
  }),
  async execute({
    sql,
    params,
    database,
  }: {
    sql: string;
    params?: unknown[];
    database?: string;
  }) {
    const rows = database
      ? await queryWithDatabase(database, sql, params)
      : await dbQuery(sql, params);

    const truncated = rows.length > MAX_ROWS;
    const result = truncated ? rows.slice(0, MAX_ROWS) : rows;

    return {
      rows: result,
      rowCount: result.length,
      truncated,
      ...(truncated && {
        message: `Results truncated to ${MAX_ROWS} rows. Use LIMIT in your query for precise control.`,
      }),
    };
  },
};

export const explainQueryTool = {
  name: "mysql_explain_query",
  description:
    "Show the execution plan for a SQL query using EXPLAIN. Helps optimize slow queries by revealing how MySQL processes the query.",
  inputSchema: z.object({
    sql: z.string().describe("The SQL query to explain"),
    format: z
      .enum(["TRADITIONAL", "JSON", "TREE"])
      .optional()
      .default("JSON")
      .describe("Output format for the explain plan"),
    database: z.string().optional().describe("Database context (optional)"),
  }),
  async execute({
    sql,
    format,
    database,
  }: {
    sql: string;
    format?: "TRADITIONAL" | "JSON" | "TREE";
    database?: string;
  }) {
    const fmt = format || "JSON";
    const explainSql = `EXPLAIN FORMAT=${fmt} ${sql}`;
    const rows = database
      ? await queryWithDatabase(database, explainSql)
      : await dbQuery(explainSql);

    if (fmt === "JSON" && rows[0]) {
      const jsonStr = (rows[0] as Record<string, unknown>)["EXPLAIN"] as string;
      try {
        return { plan: JSON.parse(jsonStr) };
      } catch {
        return { plan: jsonStr };
      }
    }
    return { plan: rows };
  },
};

export const queryTools = [queryTool, explainQueryTool];
