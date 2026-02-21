import { z } from "zod";
import { query } from "../connection.js";

export const showProcesslistTool = {
  name: "mysql_show_processlist",
  description:
    "Show active processes/connections on the MySQL server. Useful for monitoring and debugging slow queries.",
  inputSchema: z.object({
    full: z
      .boolean()
      .optional()
      .default(false)
      .describe("Show full process info including complete SQL statements"),
  }),
  async execute({ full }: { full?: boolean }) {
    const sql = full ? "SHOW FULL PROCESSLIST" : "SHOW PROCESSLIST";
    const rows = await query(sql);
    return { processes: rows, count: rows.length };
  },
};

export const showStatusTool = {
  name: "mysql_show_status",
  description:
    "Show MySQL server status variables. Can filter by pattern (e.g. 'Threads%', 'Innodb%').",
  inputSchema: z.object({
    pattern: z
      .string()
      .optional()
      .describe("LIKE pattern to filter status variables (e.g. 'Threads%')"),
    global: z
      .boolean()
      .optional()
      .default(true)
      .describe("Show global status (true) or session status (false)"),
  }),
  async execute({ pattern, global: isGlobal }: { pattern?: string; global?: boolean }) {
    const scope = isGlobal !== false ? "GLOBAL" : "SESSION";
    const sql = pattern
      ? `SHOW ${scope} STATUS LIKE ?`
      : `SHOW ${scope} STATUS`;
    const rows = await query(sql, pattern ? [pattern] : undefined);
    return { status: rows };
  },
};

export const showVariablesTool = {
  name: "mysql_show_variables",
  description:
    "Show MySQL server configuration variables. Can filter by pattern (e.g. 'max_connections', 'innodb%').",
  inputSchema: z.object({
    pattern: z
      .string()
      .optional()
      .describe("LIKE pattern to filter variables (e.g. 'innodb%')"),
    global: z
      .boolean()
      .optional()
      .default(true)
      .describe("Show global variables (true) or session variables (false)"),
  }),
  async execute({ pattern, global: isGlobal }: { pattern?: string; global?: boolean }) {
    const scope = isGlobal !== false ? "GLOBAL" : "SESSION";
    const sql = pattern
      ? `SHOW ${scope} VARIABLES LIKE ?`
      : `SHOW ${scope} VARIABLES`;
    const rows = await query(sql, pattern ? [pattern] : undefined);
    return { variables: rows };
  },
};

export const serverTools = [
  showProcesslistTool,
  showStatusTool,
  showVariablesTool,
];
