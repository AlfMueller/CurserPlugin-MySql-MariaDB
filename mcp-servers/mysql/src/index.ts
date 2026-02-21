import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { closePool } from "./connection.js";
import { schemaTools } from "./tools/schema.js";
import { queryTools } from "./tools/query.js";
import { mutateTools } from "./tools/mutate.js";
import { dataTools } from "./tools/data.js";
import { objectTools } from "./tools/objects.js";
import { serverTools } from "./tools/server.js";
import { listResources, readResource } from "./resources/schema.js";

const server = new McpServer({
  name: "mysql-mcp-server",
  version: "1.0.0",
});

type ToolDef = {
  name: string;
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

const allTools: ToolDef[] = [
  ...schemaTools,
  ...queryTools,
  ...mutateTools,
  ...dataTools,
  ...objectTools,
  ...serverTools,
] as ToolDef[];

for (const tool of allTools) {
  server.tool(
    tool.name,
    tool.description,
    tool.inputSchema.shape,
    async (args) => {
      try {
        const result = await tool.execute(args as Record<string, unknown>);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

server.resource("databases", "mysql://databases", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      mimeType: "application/json",
      text: await readResource("mysql://databases"),
    },
  ],
}));

server.resource(
  "schema",
  "mysql://schema/{database}",
  async (uri, params) => {
    const database =
      typeof params === "object" && params !== null && "database" in params
        ? String((params as Record<string, unknown>).database)
        : uri.href.split("/").pop()!;
    const resourceUri = `mysql://schema/${database}`;
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: await readResource(resourceUri),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await closePool();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closePool();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
