import { supabase } from '@/utils/supabaseClient';
import { waitForAuthSession } from '@/utils/waitForAuthSession';

/**
 * Tras signInWithPassword, fuerza que la sesión quede guardada antes de navegar.
 */
export async function completeSignIn(signInData) {
  let session = signInData?.session ?? null;

  // #region agent log
  fetch('http://127.0.0.1:7882/ingest/2a697440-281c-4f74-a253-095d80733192',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82e3a2'},body:JSON.stringify({sessionId:'82e3a2',runId:'login-debug',hypothesisId:'H2',location:'completeSignIn.js:entry',message:'completeSignIn entry',data:{hasInitialSession:!!session},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!session) {
    const { data: { session: cached } } = await supabase.auth.getSession();
    session = cached;
  }

  if (!session) {
    session = await waitForAuthSession(5000);
  }

  if (!session?.access_token || !session?.refresh_token) {
    return { ok: false, reason: 'no_session' };
  }

  const { error: setError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (setError) {
    return { ok: false, reason: 'set_session_failed', error: setError };
  }

  const { data: { session: verified } } = await supabase.auth.getSession();
  if (!verified?.user) {
    // #region agent log
    fetch('http://127.0.0.1:7882/ingest/2a697440-281c-4f74-a253-095d80733192',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82e3a2'},body:JSON.stringify({sessionId:'82e3a2',runId:'login-debug',hypothesisId:'H2',location:'completeSignIn.js:verify_failed',message:'session verify failed',data:{hasVerified:!!verified,setError:setError?.message?.slice(0,80)||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return { ok: false, reason: 'verify_failed' };
  }

  // #region agent log
  fetch('http://127.0.0.1:7882/ingest/2a697440-281c-4f74-a253-095d80733192',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'82e3a2'},body:JSON.stringify({sessionId:'82e3a2',runId:'login-debug',hypothesisId:'H2',location:'completeSignIn.js:success',message:'completeSignIn success',data:{userId:verified.user?.id?.slice(0,8)||null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return { ok: true, session: verified, user: verified.user };
}
