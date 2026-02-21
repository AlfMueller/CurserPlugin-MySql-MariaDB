import { z } from "zod";
import { query, queryWithDatabase } from "../connection.js";

export const listViewsTool = {
  name: "mysql_list_views",
  description: "List all views in a database",
  inputSchema: z.object({
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ database }: { database?: string }) {
    const sql = database
      ? `SELECT TABLE_NAME as view_name, VIEW_DEFINITION as definition 
         FROM information_schema.VIEWS WHERE TABLE_SCHEMA = ?`
      : `SELECT TABLE_NAME as view_name, VIEW_DEFINITION as definition 
         FROM information_schema.VIEWS WHERE TABLE_SCHEMA = DATABASE()`;
    const rows = await query(sql, database ? [database] : undefined);
    return { views: rows };
  },
};

export const listProceduresTool = {
  name: "mysql_list_procedures",
  description: "List all stored procedures in a database",
  inputSchema: z.object({
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ database }: { database?: string }) {
    const sql = database
      ? `SELECT ROUTINE_NAME as name, ROUTINE_TYPE as type, DTD_IDENTIFIER as return_type,
                CREATED as created, LAST_ALTERED as last_altered
         FROM information_schema.ROUTINES 
         WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'`
      : `SELECT ROUTINE_NAME as name, ROUTINE_TYPE as type, DTD_IDENTIFIER as return_type,
                CREATED as created, LAST_ALTERED as last_altered
         FROM information_schema.ROUTINES 
         WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE'`;
    const rows = await query(sql, database ? [database] : undefined);
    return { procedures: rows };
  },
};

export const listFunctionsTool = {
  name: "mysql_list_functions",
  description: "List all stored functions in a database",
  inputSchema: z.object({
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ database }: { database?: string }) {
    const sql = database
      ? `SELECT ROUTINE_NAME as name, DTD_IDENTIFIER as return_type,
                CREATED as created, LAST_ALTERED as last_altered
         FROM information_schema.ROUTINES 
         WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'FUNCTION'`
      : `SELECT ROUTINE_NAME as name, DTD_IDENTIFIER as return_type,
                CREATED as created, LAST_ALTERED as last_altered
         FROM information_schema.ROUTINES 
         WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'FUNCTION'`;
    const rows = await query(sql, database ? [database] : undefined);
    return { functions: rows };
  },
};

export const listTriggersTool = {
  name: "mysql_list_triggers",
  description: "List all triggers in a database",
  inputSchema: z.object({
    database: z.string().optional().describe("Database name (optional)"),
  }),
  async execute({ database }: { database?: string }) {
    const sql = database
      ? `SELECT TRIGGER_NAME as name, EVENT_MANIPULATION as event,
                EVENT_OBJECT_TABLE as table_name, ACTION_TIMING as timing,
                ACTION_STATEMENT as statement
         FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = ?`
      : `SELECT TRIGGER_NAME as name, EVENT_MANIPULATION as event,
                EVENT_OBJECT_TABLE as table_name, ACTION_TIMING as timing,
                ACTION_STATEMENT as statement
         FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()`;
    const rows = await query(sql, database ? [database] : undefined);
    return { triggers: rows };
  },
};

export const objectTools = [
  listViewsTool,
  listProceduresTool,
  listFunctionsTool,
  listTriggersTool,
];
