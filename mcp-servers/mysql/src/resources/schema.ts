import { query, queryWithDatabase } from "../connection.js";

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export async function listResources(): Promise<ResourceDefinition[]> {
  const resources: ResourceDefinition[] = [
    {
      uri: "mysql://databases",
      name: "Database List",
      description: "List of all databases on the server",
      mimeType: "application/json",
    },
  ];

  try {
    const databases = await query<{ Database: string }>("SHOW DATABASES");
    for (const db of databases) {
      resources.push({
        uri: `mysql://schema/${db.Database}`,
        name: `Schema: ${db.Database}`,
        description: `Full schema of the '${db.Database}' database`,
        mimeType: "application/json",
      });
    }
  } catch {
    // Connection might not be available yet during resource listing
  }

  return resources;
}

export async function readResource(uri: string): Promise<string> {
  const url = new URL(uri);

  if (uri === "mysql://databases") {
    const rows = await query<{ Database: string }>("SHOW DATABASES");
    return JSON.stringify(rows.map((r) => r.Database), null, 2);
  }

  const schemaMatch = uri.match(/^mysql:\/\/schema\/(.+)$/);
  if (schemaMatch) {
    const database = schemaMatch[1];
    const tables = await queryWithDatabase(database, "SHOW TABLES");
    const tableNames = tables.map((r) => Object.values(r)[0] as string);

    const schema: Record<string, unknown> = { database, tables: {} };

    for (const tableName of tableNames) {
      const columns = await queryWithDatabase(
        database,
        `DESCRIBE \`${tableName}\``,
      );
      const indexes = await queryWithDatabase(
        database,
        `SHOW INDEX FROM \`${tableName}\``,
      );
      (schema.tables as Record<string, unknown>)[tableName] = { columns, indexes };
    }

    return JSON.stringify(schema, null, 2);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}
