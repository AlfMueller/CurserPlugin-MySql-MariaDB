---
name: schema-design
description: Guide for designing MySQL/MariaDB database schemas with best practices for normalization, indexing, data types, and relationships.
---

# Schema Design Best Practices

## Trigger

Use when designing a new database schema, reviewing an existing one, or optimizing table structures.

## Workflow

1. Understand the domain and data requirements
2. Identify entities and their relationships
3. Apply normalization rules (aim for 3NF, denormalize only with justification)
4. Choose appropriate data types
5. Design indexes for expected query patterns
6. Add constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK)
7. Review with `SHOW CREATE TABLE` and `EXPLAIN` on expected queries

## Data Type Guidelines

- Use `INT` / `BIGINT` for IDs, never `VARCHAR` for primary keys unless required
- Use `VARCHAR(n)` with appropriate length, not `TEXT` for short strings
- Use `DECIMAL(p,s)` for monetary values, never `FLOAT` / `DOUBLE`
- Use `DATETIME` or `TIMESTAMP` for dates, prefer `TIMESTAMP` for audit columns
- Use `ENUM` sparingly — prefer lookup tables for extensibility
- Use `JSON` type for flexible/dynamic data (MySQL 5.7+)
- Use `TINYINT(1)` for boolean values

## Indexing Strategy

- Every table should have a PRIMARY KEY
- Index columns used in WHERE, JOIN, and ORDER BY clauses
- Use composite indexes matching query patterns (leftmost prefix rule)
- Avoid over-indexing — each index slows down writes
- Use `EXPLAIN` to verify index usage
- Consider covering indexes for read-heavy queries

## Naming Conventions

- Tables: `snake_case`, plural (`users`, `order_items`)
- Columns: `snake_case` (`created_at`, `user_id`)
- Foreign keys: `<referenced_table_singular>_id` (`user_id`, `order_id`)
- Indexes: `idx_<table>_<columns>` (`idx_users_email`)
- Unique constraints: `uq_<table>_<columns>` (`uq_users_email`)

## Output

- Schema design recommendation with CREATE TABLE statements
- Index recommendations with justification
- Relationship diagram (textual)
