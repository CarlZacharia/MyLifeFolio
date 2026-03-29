/**
 * Generic SQLite query engine that translates Supabase-style query parameters
 * into SQLite prepared statements.
 *
 * This is the bridge between the renderer's dbClient.from().select().eq()
 * calls and actual SQLite execution.
 */

import type Database from 'better-sqlite3';

interface Filter {
  column: string;
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: unknown;
}

interface OrderClause {
  column: string;
  ascending: boolean;
}

interface QueryParams {
  method: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  columns?: string;
  filters?: Filter[];
  orders?: OrderClause[];
  limit?: number | null;
  single?: boolean;
  body?: unknown;
  returning?: boolean;
  onConflict?: string | null;
}

// Validate that a table/column name is safe (alphanumeric + underscore only)
function safeName(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid identifier: ${name}`);
  }
  return name;
}

function buildWhereClause(filters: Filter[]): { sql: string; params: unknown[] } {
  if (!filters || filters.length === 0) return { sql: '', params: [] };

  const clauses: string[] = [];
  const params: unknown[] = [];

  for (const f of filters) {
    const col = safeName(f.column);
    switch (f.op) {
      case 'eq':
        clauses.push(`${col} = ?`);
        params.push(f.value);
        break;
      case 'neq':
        clauses.push(`${col} != ?`);
        params.push(f.value);
        break;
      case 'gt':
        clauses.push(`${col} > ?`);
        params.push(f.value);
        break;
      case 'gte':
        clauses.push(`${col} >= ?`);
        params.push(f.value);
        break;
      case 'lt':
        clauses.push(`${col} < ?`);
        params.push(f.value);
        break;
      case 'lte':
        clauses.push(`${col} <= ?`);
        params.push(f.value);
        break;
      case 'like':
        clauses.push(`${col} LIKE ?`);
        params.push(f.value);
        break;
      case 'ilike':
        clauses.push(`LOWER(${col}) LIKE ?`);
        params.push(String(f.value).toLowerCase());
        break;
      case 'in': {
        const arr = f.value as unknown[];
        if (arr.length === 0) {
          clauses.push('1 = 0'); // empty IN → no results
        } else {
          const placeholders = arr.map(() => '?').join(', ');
          clauses.push(`${col} IN (${placeholders})`);
          params.push(...arr);
        }
        break;
      }
      case 'is':
        if (f.value === null) {
          clauses.push(`${col} IS NULL`);
        } else {
          clauses.push(`${col} = ?`);
          params.push(f.value);
        }
        break;
    }
  }

  return { sql: ` WHERE ${clauses.join(' AND ')}`, params };
}

function buildOrderClause(orders: OrderClause[]): string {
  if (!orders || orders.length === 0) return '';
  const parts = orders.map(o => `${safeName(o.column)} ${o.ascending ? 'ASC' : 'DESC'}`);
  return ` ORDER BY ${parts.join(', ')}`;
}

export function executeQuery(
  db: Database.Database,
  table: string,
  params: QueryParams,
): { data: unknown; error: unknown } {
  const tableName = safeName(table);

  try {
    switch (params.method) {
      case 'select': {
        const columns = params.columns === '*' ? '*' : params.columns!
          .split(',')
          .map(c => safeName(c.trim()))
          .join(', ');

        const where = buildWhereClause(params.filters || []);
        const order = buildOrderClause(params.orders || []);
        const limit = params.limit ? ` LIMIT ${Number(params.limit)}` : '';

        const sql = `SELECT ${columns} FROM ${tableName}${where.sql}${order}${limit}`;
        const stmt = db.prepare(sql);

        if (params.single) {
          const row = stmt.get(...where.params);
          if (!row) {
            return { data: null, error: { message: `No rows found in ${tableName}` } };
          }
          return { data: parseRow(row as Record<string, unknown>), error: null };
        }

        const rows = stmt.all(...where.params) as Record<string, unknown>[];
        return { data: rows.map(parseRow), error: null };
      }

      case 'insert': {
        const rows = Array.isArray(params.body) ? params.body : [params.body];
        const results: Record<string, unknown>[] = [];

        for (const row of rows) {
          const data = row as Record<string, unknown>;
          // Auto-generate UUID if no id provided
          if (!data.id) data.id = crypto.randomUUID();
          // Auto-set timestamps
          const now = new Date().toISOString();
          if (!data.created_at) data.created_at = now;
          if (!data.updated_at) data.updated_at = now;

          // Serialize objects/arrays to JSON strings
          const processedData = serializeRow(data);

          const cols = Object.keys(processedData).map(safeName);
          const placeholders = cols.map(() => '?').join(', ');
          const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})`;
          db.prepare(sql).run(...Object.values(processedData));

          if (params.returning) {
            const inserted = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id) as Record<string, unknown>;
            if (inserted) results.push(parseRow(inserted));
          }
        }

        if (params.returning) {
          return {
            data: params.single || !Array.isArray(params.body) ? results[0] ?? null : results,
            error: null,
          };
        }
        return { data: null, error: null };
      }

      case 'update': {
        const data = serializeRow(params.body as Record<string, unknown>);
        // Auto-update timestamp
        if (!data.updated_at) data.updated_at = new Date().toISOString();

        const setClauses = Object.keys(data).map(k => `${safeName(k)} = ?`);
        const setValues = Object.values(data);
        const where = buildWhereClause(params.filters || []);

        const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')}${where.sql}`;
        db.prepare(sql).run(...setValues, ...where.params);

        if (params.returning) {
          // Re-select the updated rows
          const selectSql = `SELECT * FROM ${tableName}${where.sql}`;
          const rows = db.prepare(selectSql).all(...where.params) as Record<string, unknown>[];
          const parsed = rows.map(parseRow);
          return { data: params.single ? parsed[0] ?? null : parsed, error: null };
        }
        return { data: null, error: null };
      }

      case 'delete': {
        const where = buildWhereClause(params.filters || []);
        const sql = `DELETE FROM ${tableName}${where.sql}`;
        db.prepare(sql).run(...where.params);
        return { data: null, error: null };
      }

      case 'upsert': {
        const rows = Array.isArray(params.body) ? params.body : [params.body];
        const results: Record<string, unknown>[] = [];

        for (const row of rows) {
          const data = row as Record<string, unknown>;
          if (!data.id) data.id = crypto.randomUUID();
          const now = new Date().toISOString();
          if (!data.created_at) data.created_at = now;
          if (!data.updated_at) data.updated_at = now;

          const processedData = serializeRow(data);
          const cols = Object.keys(processedData).map(safeName);
          const placeholders = cols.map(() => '?').join(', ');
          const updateCols = cols.filter(c => c !== 'id').map(c => `${c} = excluded.${c}`);

          let conflictTarget = 'id';
          if (params.onConflict) {
            conflictTarget = params.onConflict.split(',').map(c => safeName(c.trim())).join(', ');
          }

          const sql = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders})
            ON CONFLICT(${conflictTarget}) DO UPDATE SET ${updateCols.join(', ')}`;
          db.prepare(sql).run(...Object.values(processedData));

          if (params.returning) {
            const inserted = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(data.id) as Record<string, unknown>;
            if (inserted) results.push(parseRow(inserted));
          }
        }

        if (params.returning) {
          return {
            data: params.single || !Array.isArray(params.body) ? results[0] ?? null : results,
            error: null,
          };
        }
        return { data: null, error: null };
      }

      default:
        return { data: null, error: { message: `Unknown method: ${params.method}` } };
    }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message } };
  }
}

/**
 * Serialize JavaScript objects/arrays in row data to JSON strings for SQLite storage.
 */
function serializeRow(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      result[key] = value ? 1 : 0;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Parse a SQLite row: deserialize JSON strings back to objects/arrays,
 * convert integer booleans back to booleans where appropriate.
 */
function parseRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'string') {
      // Try to parse JSON strings (arrays and objects)
      if ((value.startsWith('[') && value.endsWith(']')) ||
          (value.startsWith('{') && value.endsWith('}'))) {
        try {
          result[key] = JSON.parse(value);
          continue;
        } catch {
          // Not valid JSON — keep as string
        }
      }
    }
    result[key] = value;
  }
  return result;
}
