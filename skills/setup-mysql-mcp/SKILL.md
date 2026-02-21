---
name: setup-mysql-mcp
description: Set up and configure the MySQL/MariaDB MCP server for Cursor. Guides through installation, environment variables, and connection testing.
---

# Setup MySQL MCP Server

## Trigger

Use when a user needs to install, configure, or troubleshoot the MySQL/MariaDB MCP server connection.

## Workflow

1. Check if Node.js is installed (required: v18+)
2. Navigate to the MCP server directory and install dependencies:

```bash
cd mcp-servers/mysql
npm install
npm run build
```

3. Configure environment variables. Create or update the MCP server configuration in Cursor settings with:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["<path-to-plugin>/mcp-servers/mysql/dist/index.js"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_default_database",
        "MYSQL_POOL_SIZE": "10",
        "MYSQL_CONNECT_TIMEOUT": "10000"
      }
    }
  }
}
```

4. Test the connection by using the `mysql_list_databases` tool
5. If connection fails, check:
   - Is the MySQL/MariaDB server running?
   - Are host, port, user, and password correct?
   - Is the firewall allowing connections on the configured port?
   - Does the user have the required privileges?

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MYSQL_HOST` | `localhost` | Database server hostname |
| `MYSQL_PORT` | `3306` | Database server port |
| `MYSQL_USER` | `root` | Database user |
| `MYSQL_PASSWORD` | (empty) | Database password |
| `MYSQL_DATABASE` | (none) | Default database |
| `MYSQL_POOL_SIZE` | `10` | Max concurrent connections |
| `MYSQL_CONNECT_TIMEOUT` | `10000` | Connection timeout in ms |

## Output

- Working MCP server connection to MySQL/MariaDB
- Verified with a successful `mysql_list_databases` call
