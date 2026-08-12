/**
 * In-memory Writing Engine DB for local/E2E when no approved migrated DB exists.
 * Mirrors unique + mark CHECKs enough for orchestrator persistence tests.
 * Not a substitute for R5 real-database verification.
 */
import { randomUUID } from 'node:crypto';
import { CAMBRIDGE_CRITERION_KEYS } from '../../domain/schemas';
import type { Row, WritingEngineDb, WritingEngineTable } from '../persistence/writing-engine.repository';

const UNIQUE: Partial<Record<WritingEngineTable, string[][]>> = {
  writing_task_analyses: [['task_fingerprint']],
  writing_observations: [['execution_id', 'observation_id']],
  writing_assessments: [['execution_id']],
  writing_assessment_criteria: [['execution_id', 'criterion']],
  writing_feedback_payloads: [['execution_id']],
  writing_validation_results: [['execution_id', 'stage', 'attempt']],
};

export class WritingEngineMemoryDb implements WritingEngineDb {
  readonly tables = new Map<string, Row[]>();

  private rows(table: string): Row[] {
    if (!this.tables.has(table)) this.tables.set(table, []);
    return this.tables.get(table)!;
  }

  async insert(table: WritingEngineTable, rows: Row[]): Promise<Row[]> {
    const inserted: Row[] = [];
    for (const row of rows) {
      const stored: Row = {
        id: row.id ?? randomUUID(),
        created_at: new Date().toISOString(),
        ...row,
      };

      if (table === 'writing_assessment_criteria') {
        const mark = stored.mark;
        if (typeof mark !== 'number' || mark < 0 || mark > 5 || !Number.isInteger(mark)) {
          throw new Error(`mark ${String(mark)} outside 0–5`);
        }
        if (!(CAMBRIDGE_CRITERION_KEYS as readonly string[]).includes(String(stored.criterion))) {
          throw new Error(`invalid criterion ${String(stored.criterion)}`);
        }
      }
      if (table === 'writing_assessments') {
        if (stored.status === 'incomplete' && stored.raw_total !== null && stored.raw_total !== undefined) {
          throw new Error('incomplete assessment must not carry raw_total');
        }
      }

      const keys = UNIQUE[table] || [];
      for (const cols of keys) {
        const exists = this.rows(table).some((existing) =>
          cols.every((col) => existing[col] === stored[col]),
        );
        if (exists) throw new Error(`unique violation on ${table} (${cols.join(',')})`);
      }

      this.rows(table).push(stored);
      inserted.push({ ...stored });
    }
    return inserted;
  }

  async select(
    table: WritingEngineTable,
    match: Row,
    options?: { orderBy?: string; ascending?: boolean },
  ): Promise<Row[]> {
    let rows = this.rows(table).filter((row) =>
      Object.entries(match).every(([k, v]) => row[k] === v),
    );
    if (options?.orderBy) {
      const key = options.orderBy;
      const asc = options.ascending !== false;
      rows = [...rows].sort((a, b) => {
        const av = String(a[key] ?? '');
        const bv = String(b[key] ?? '');
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows.map((r) => ({ ...r }));
  }

  async update(table: WritingEngineTable, match: Row, patch: Row): Promise<Row[]> {
    const updated: Row[] = [];
    const rows = this.rows(table);
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      if (!Object.entries(match).every(([k, v]) => row[k] === v)) continue;
      if (table === 'writing_engine_executions' && row.status !== 'running' && patch.status) {
        throw new Error('append-only: cannot rewrite finalised execution');
      }
      const next = { ...row, ...patch };
      rows[i] = next;
      updated.push({ ...next });
    }
    return updated;
  }
}

export function createWritingEngineMemoryDb(): WritingEngineMemoryDb {
  return new WritingEngineMemoryDb();
}
