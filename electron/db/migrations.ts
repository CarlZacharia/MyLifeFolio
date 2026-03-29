import type Database from 'better-sqlite3';

// Schema version tracking
const CURRENT_VERSION = 1;

export function runMigrations(db: Database.Database): void {
  // Create version tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_version (
      version INTEGER NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const row = db.prepare('SELECT MAX(version) as version FROM _schema_version').get() as { version: number | null } | undefined;
  const currentVersion = row?.version ?? 0;

  if (currentVersion < CURRENT_VERSION) {
    // Run all pending migrations in a transaction
    db.transaction(() => {
      if (currentVersion < 1) migration_001(db);
      // Future migrations go here: if (currentVersion < 2) migration_002(db);

      db.prepare('INSERT INTO _schema_version (version) VALUES (?)').run(CURRENT_VERSION);
    })();
  }
}

function migration_001(db: Database.Database): void {
  // This will be populated in Phase 4 with all table CREATE statements
  // Placeholder so the module compiles
  db.exec('SELECT 1');
}
