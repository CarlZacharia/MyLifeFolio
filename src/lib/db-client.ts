/**
 * Local database client that mimics the Supabase query builder interface.
 *
 * Components change their import from `supabase` to `dbClient` and keep
 * the same .from().select().eq().single() call pattern. Under the hood,
 * queries are sent to the Electron main process via IPC.
 *
 * Supabase response shape: { data: T | null, error: { message: string } | null }
 * This client returns the same shape.
 */

type FilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';

interface Filter {
  column: string;
  op: FilterOp;
  value: unknown;
}

interface OrderClause {
  column: string;
  ascending: boolean;
}

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

class QueryBuilder<T = Record<string, unknown>> {
  private _table: string;
  private _method: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private _columns: string = '*';
  private _filters: Filter[] = [];
  private _orders: OrderClause[] = [];
  private _limitVal: number | null = null;
  private _singleRow = false;
  private _body: unknown = null;
  private _returning = false;
  private _onConflict: string | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(columns: string = '*'): this {
    this._method = 'select';
    this._columns = columns;
    return this;
  }

  insert(data: unknown): this {
    this._method = 'insert';
    this._body = data;
    return this;
  }

  update(data: unknown): this {
    this._method = 'update';
    this._body = data;
    return this;
  }

  delete(): this {
    this._method = 'delete';
    return this;
  }

  upsert(data: unknown, options?: { onConflict?: string }): this {
    this._method = 'upsert';
    this._body = data;
    this._onConflict = options?.onConflict ?? null;
    return this;
  }

  // Filters
  eq(column: string, value: unknown): this {
    this._filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown): this {
    this._filters.push({ column, op: 'neq', value });
    return this;
  }

  gt(column: string, value: unknown): this {
    this._filters.push({ column, op: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown): this {
    this._filters.push({ column, op: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown): this {
    this._filters.push({ column, op: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown): this {
    this._filters.push({ column, op: 'lte', value });
    return this;
  }

  like(column: string, value: string): this {
    this._filters.push({ column, op: 'like', value });
    return this;
  }

  ilike(column: string, value: string): this {
    this._filters.push({ column, op: 'ilike', value: value.toLowerCase() });
    return this;
  }

  in(column: string, values: unknown[]): this {
    this._filters.push({ column, op: 'in', value: values });
    return this;
  }

  is(column: string, value: unknown): this {
    this._filters.push({ column, op: 'is', value });
    return this;
  }

  // Ordering
  order(column: string, options?: { ascending?: boolean }): this {
    this._orders.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  // Limit
  limit(count: number): this {
    this._limitVal = count;
    return this;
  }

  // Single row
  single(): Promise<QueryResult<T>> {
    this._singleRow = true;
    return this.then();
  }

  // Maybe single (returns null if not found instead of error)
  maybeSingle(): Promise<QueryResult<T | null>> {
    this._singleRow = true;
    return this.then().then(result => {
      if (result.error?.message?.includes('no rows')) {
        return { data: null, error: null };
      }
      return result;
    });
  }

  // For chaining after insert/update/upsert to get returned data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select_after(_columns?: string): this {
    this._returning = true;
    return this;
  }

  // Execute the query via IPC
  async then(): Promise<QueryResult<T>> {
    try {
      const params = {
        method: this._method,
        columns: this._columns,
        filters: this._filters,
        orders: this._orders,
        limit: this._limitVal,
        single: this._singleRow,
        body: this._body,
        returning: this._returning,
        onConflict: this._onConflict,
      };

      const result = await window.electronAPI.db.query(this._table, this._method, params);
      return result as QueryResult<T>;
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  }
}

/**
 * Database client that mirrors the Supabase client API.
 *
 * Usage:
 *   import { dbClient } from './db-client';
 *
 *   // Before (Supabase):
 *   const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
 *
 *   // After (db-client):
 *   const { data, error } = await dbClient.from('profiles').select('*').eq('id', userId).single();
 */
export const dbClient = {
  from<T = Record<string, unknown>>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  },

  /** RPC call — mirrors supabase.rpc() */
  async rpc(functionName: string, params?: unknown): Promise<QueryResult<unknown>> {
    try {
      return await window.electronAPI.db.rpc(functionName, params);
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  },

  /** Storage operations — mirrors supabase.storage */
  storage: {
    from(bucketName: string) {
      return {
        async upload(path: string, file: File | Blob | Uint8Array, options?: { contentType?: string }) {
          try {
            let data: Uint8Array;
            if (file instanceof Uint8Array) {
              data = file;
            } else {
              const buf = await (file as Blob).arrayBuffer();
              data = new Uint8Array(buf);
            }
            const contentType = options?.contentType || (file instanceof File ? file.type : 'application/octet-stream');
            const result = await window.electronAPI.files.save(bucketName, path, data, contentType);
            return result;
          } catch (err) {
            return { data: null, error: { message: (err as Error).message } };
          }
        },

        async download(path: string) {
          try {
            const result = await window.electronAPI.files.read(bucketName, path);
            if (result.error) return result;
            return { data: new Blob([result.data as Uint8Array]), error: null };
          } catch (err) {
            return { data: null, error: { message: (err as Error).message } };
          }
        },

        async remove(paths: string[]) {
          try {
            return await window.electronAPI.files.remove(bucketName, paths);
          } catch (err) {
            return { data: null, error: { message: (err as Error).message } };
          }
        },

        getPublicUrl(path: string) {
          // For local files, return a file:// URL synchronously
          return {
            data: { publicUrl: `local-file://${bucketName}/${path}` },
          };
        },

        async createSignedUrl(path: string, _expiresIn: number) {
          try {
            const result = await window.electronAPI.files.getUrl(bucketName, path);
            if (result.error) return result;
            return { data: { signedUrl: result.data }, error: null };
          } catch (err) {
            return { data: null, error: { message: (err as Error).message } };
          }
        },
      };
    },
  },

  /** Auth stub — returns the local user for compatibility */
  auth: {
    async getUser() {
      return {
        data: {
          user: {
            id: 'local-user',
            email: 'local@mylifefolio.desktop',
            email_confirmed_at: new Date().toISOString(),
          },
        },
        error: null,
      };
    },

    async getSession() {
      return {
        data: {
          session: {
            access_token: 'local-session',
            user: {
              id: 'local-user',
              email: 'local@mylifefolio.desktop',
            },
          },
        },
        error: null,
      };
    },
  },

  /** Functions stub — for edge functions that remain cloud-based */
  functions: {
    async invoke(functionName: string, options?: { body?: unknown }) {
      // Cloud functions (AI proxies) would be called via fetch from main process
      // For now, return a not-implemented error for functions that haven't been migrated
      console.warn(`Edge function "${functionName}" called — cloud functions require internet access`);
      return {
        data: null,
        error: { message: `Edge function "${functionName}" is a cloud service and requires internet access` },
      };
    },
  },
};

export default dbClient;
