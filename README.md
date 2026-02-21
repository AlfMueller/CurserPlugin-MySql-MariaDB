# MySQL / MariaDB MCP Plugin

A Cursor plugin providing full MySQL/MariaDB database integration via MCP (Model Context Protocol). Includes 20 database tools, safety guards, schema resources, and an AI database architect agent.

## Features

- **Connection Pooling** — Fast, reusable connections via `mysql2` with configurable pool size
- **Schema Inspection** — List databases, tables, columns, indexes, views, procedures, functions, triggers
- **Query Execution** — Run arbitrary SQL with parameterized queries and EXPLAIN support
- **Data Manipulation** — Insert, update, delete with mandatory WHERE clauses and confirmation guards
- **DDL Operations** — Create, alter, and drop tables with safety checks
- **Server Monitoring** — Process list, server status, configuration variables
- **MCP Resources** — Passive schema context for AI agents
- **SQL Safety Rules** — Automatic protection against accidental destructive operations

## Setup

### 1. Install & Build

```bash
cd mcp-servers/mysql
npm install
npm run build
```

### 2. Configure in Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mysql-mcp": {
      "command": "node",
      "args": ["<path-to-plugin>/mcp-servers/mysql/dist/index.js"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database",
        "MYSQL_POOL_SIZE": "10",
        "MYSQL_CONNECT_TIMEOUT": "10000"
      }
    }
  }
}
```

### 3. Restart Cursor

Restart Cursor or reload MCP servers for the new server to be recognized.

## Tools (20)

### Schema Inspection

| Tool | Description |
|---|---|
| `mysql_list_databases` | List all databases on the server |
| `mysql_list_tables` | List all tables in a database |
| `mysql_describe_table` | Show column structure of a table |
| `mysql_show_indexes` | Show all indexes for a table |
| `mysql_show_create_table` | Show the full CREATE TABLE statement |

### Query Execution

| Tool | Description |
|---|---|
| `mysql_query` | Execute arbitrary SQL (returns up to 1000 rows) |
| `mysql_explain_query` | Show execution plan (TRADITIONAL, JSON, or TREE format) |

### DDL (Schema Changes)

| Tool | Description |
|---|---|
| `mysql_create_table` | Create a new table |
| `mysql_alter_table` | Alter an existing table |
| `mysql_drop_table` | Drop a table (requires `confirm=true`) |

### Data Manipulation

| Tool | Description |
|---|---|
| `mysql_insert` | Insert one or more rows |
| `mysql_update` | Update rows (WHERE clause required) |
| `mysql_delete` | Delete rows (WHERE clause + `confirm=true` required) |

### Database Objects

| Tool | Description |
|---|---|
| `mysql_list_views` | List all views |
| `mysql_list_procedures` | List all stored procedures |
| `mysql_list_functions` | List all stored functions |
| `mysql_list_triggers` | List all triggers |

### Server Monitoring

| Tool | Description |
|---|---|
| `mysql_show_processlist` | Show active connections and queries |
| `mysql_show_status` | Show server status variables (filterable) |
| `mysql_show_variables` | Show server configuration variables (filterable) |

## MCP Resources

| Resource URI | Description |
|---|---|
| `mysql://databases` | List of all databases |
| `mysql://schema/{database}` | Full schema of a database (tables, columns, indexes) |

## Components

| Component | Path | Description |
|---|---|---|
| MCP Server | `mcp-servers/mysql/` | Core database tools and resources |
| SQL Safety Rules | `rules/sql-safety.mdc` | Prevents accidental destructive operations |
| Setup Skill | `skills/setup-mysql-mcp/` | Guided installation and configuration |
| Schema Design Skill | `skills/schema-design/` | Database schema design best practices |
| DB Architect Agent | `agents/db-architect.md` | Schema consultation and query optimization |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MYSQL_HOST` | `localhost` | Database server hostname |
| `MYSQL_PORT` | `3306` | Database server port |
| `MYSQL_USER` | `root` | Database user |
| `MYSQL_PASSWORD` | *(empty)* | Database password |
| `MYSQL_DATABASE` | *(none)* | Default database |
| `MYSQL_POOL_SIZE` | `10` | Maximum concurrent connections |
| `MYSQL_CONNECT_TIMEOUT` | `10000` | Connection timeout in milliseconds |

## Safety Features

- **DROP TABLE** requires explicit `confirm=true` parameter
- **DELETE** requires `confirm=true` and a WHERE clause
- **UPDATE** requires a WHERE clause
- Parameterized queries (prepared statements) prevent SQL injection
- Query results are capped at 1000 rows to prevent memory issues
- Connection pooling with keep-alive for reliable connections

## License

MIT
