import pg from 'pg';

const url = process.env.SPEAKING_B2_ITEST_DATABASE_URL;
const action = process.argv[2];
const sessionId = process.argv[3];
const userId = process.argv[4];

function payload(row) {
  const value = row?.payload;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 4000 });
await client.connect();
try {
  if (action === 'consume') {
    const result = await client.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',5,null,null,null) as payload`,
      [sessionId, userId],
    );
    process.stdout.write(JSON.stringify({ pid: process.pid, payload: payload(result.rows[0]) }));
  } else if (action === 'consume-daily') {
    const result = await client.query(
      `select speaking_b2_consume_session_quota($1,$2,'speaking_correction','month','2026-10',null,'exam_speaking_feedback','2026-10-27',3) as payload`,
      [sessionId, userId],
    );
    process.stdout.write(JSON.stringify({ pid: process.pid, payload: payload(result.rows[0]) }));
  } else if (action === 'claim') {
    await client.query('select speaking_b2_claim_evaluation($1)', [sessionId]);
    const lock = await client.query(
      'select evaluation_in_flight, row_version from speaking_b2_sessions where id=$1',
      [sessionId],
    );
    process.stdout.write(JSON.stringify({ pid: process.pid, lock: lock.rows[0] }));
  } else if (action === 'read') {
    const session = await client.query(
      'select state, evaluation_charged, pending_report is not null as has_pending, report is not null as has_report from speaking_b2_sessions where id=$1',
      [sessionId],
    );
    const turns = await client.query(
      'select count(*)::int as n from speaking_b2_turns where session_id=$1',
      [sessionId],
    );
    process.stdout.write(JSON.stringify({ pid: process.pid, session: session.rows[0], turns: turns.rows[0].n }));
  } else {
    throw new Error(`unknown action ${action}`);
  }
} finally {
  await client.end();
}
