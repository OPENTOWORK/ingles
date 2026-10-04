import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  applyAuditedOrgSettings,
  applyAuditedPlan,
  applyAuditedProfileField,
  assertAuditTransactionReady,
  auditText,
  buildAdminPlanWriteResult,
} from '@/lib/adminChangeLog.js';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout.js';
import {
  applyLegalIdentityDescription,
  persistedLegalIdentity,
  persistedOrgBranding,
  validateOrgSettingsPatch,
} from '@/lib/orgSettings.js';
import { saveOrgSettings } from '@/lib/orgSettingsServer.js';
import { validateAccesoWeb } from '@/lib/adminAccesos.js';
import { saveAccesoWeb } from '@/lib/adminAccesosServer.js';

function fakeDb({ rpcResult = true, rpcError = null } = {}) {
  const calls = [];
  return {
    calls,
    async rpc(name, args) {
      calls.push({ type: 'rpc', name, args });
      if (typeof rpcError === 'function') return rpcError(name, args);
      if (rpcError) return { data: null, error: rpcError };
      const data = typeof rpcResult === 'function' ? rpcResult(name, args) : rpcResult;
      return { data, error: null };
    },
    from(table) {
      calls.push({ type: 'from', table });
      throw new Error(`No debe escribir en ${table}`);
    },
  };
}

describe('configuración general', () => {
  it('rechaza claves que no están en la lista', () => {
    const result = validateOrgSettingsPatch({ 'smtp.password': 'secreto' });
    assert.equal(result.ok, false);
  });

  it('normaliza el correo de soporte', () => {
    const result = validateOrgSettingsPatch({
      'contacto.soporte_email': ' Soporte@Dralo.es ',
    });
    assert.equal(result.ok, true);
    assert.equal(result.values['contacto.soporte_email'], 'soporte@dralo.es');
  });

  it('sustituye solo las líneas guardadas del cuadro de los términos', () => {
    const identity = persistedLegalIdentity([
      { clave: 'legal.titular', valor: 'DRALO ACADEMY SL' },
    ]);
    assert.equal(identity.titular, 'DRALO ACADEMY SL');
    assert.equal(identity.cif, '');
    assert.equal(
      applyLegalIdentityDescription('Titular:', 'Servipacar SL', identity),
      'DRALO ACADEMY SL',
    );
    assert.equal(
      applyLegalIdentityDescription('CIF:', 'B82133760', identity),
      'B82133760',
    );
  });

  it('no aplica a los correos un valor que solo existe como texto fijo', () => {
    const branding = persistedOrgBranding([
      { clave: 'org.nombre_publico', valor: 'Dralo Academy' },
    ]);
    assert.equal(branding.brandName, 'Dralo Academy');
    assert.equal(branding.supportEmail, '');
  });
});

describe('historial', () => {
  it('no guarda secretos en el texto auditado', () => {
    assert.equal(auditText('token super-secreto'), '[omitido]');
    assert.equal(auditText('alumno'), 'alumno');
  });
});

describe('escrituras sin migración', () => {
  const missing = {
    code: 'PGRST202',
    message: 'Could not find the function public.admin_apply_profile_field',
  };

  it('si falla la función de auditoría, no toca la tabla', async () => {
    const db = fakeDb({ rpcError: missing });
    await assert.rejects(
      () => applyAuditedProfileField(db, {
        actorId: 'actor-1',
        userId: 'user-1',
        column: 'activo',
        nextValue: false,
      }),
      (error) => error.status === 503 && /No se ha guardado ningún cambio/.test(error.message),
    );
    assert.equal(db.calls.some((call) => call.type === 'from'), false);
    assert.equal(db.calls.filter((call) => call.name === 'admin_apply_profile_field').length, 1);
  });

  it('un actor que la base no reconoce como administrador no escribe', async () => {
    const db = fakeDb({ rpcError: { code: 'P0001', message: 'actor no administrador' } });
    await assert.rejects(
      () => applyAuditedPlan(db, {
        actorId: 'alumno-1',
        userId: 'user-1',
        planSlug: 'free',
      }),
      (error) => error.status === 403 && /administrador/.test(error.message),
    );
    assert.equal(db.calls.some((call) => call.type === 'from'), false);
  });

  it('la comprobación previa también bloquea si la migración no está', async () => {
    const db = fakeDb({
      rpcError: { code: 'PGRST202', message: 'Could not find the function public.admin_audit_ready' },
    });
    await assert.rejects(
      () => assertAuditTransactionReady(db, 'actor-1'),
      (error) => error.status === 503,
    );
    assert.equal(db.calls.some((call) => call.type === 'from'), false);
  });

  it('la configuración no llama a la escritura si la auditoría no está lista', async () => {
    const calls = [];
    const db = {
      from() {
        calls.push('read');
        return {
          select() { return this; },
          in() { return Promise.resolve({ data: [], error: null }); },
        };
      },
      async rpc(name) {
        calls.push(name);
        return {
          data: null,
          error: { code: 'PGRST202', message: 'Could not find the function public.admin_audit_ready' },
        };
      },
    };

    await assert.rejects(
      () => saveOrgSettings(db, 'actor-1', { 'org.nombre_publico': 'Academia Dralo' }),
      (error) => error.status === 503,
    );
    assert.deepEqual(calls, ['read', 'admin_audit_ready']);
  });
});

describe('un solo registro por cambio confirmado', () => {
  it('el rol confirmado sale de la función y JavaScript no inserta otro historial', async () => {
    const db = fakeDb({ rpcResult: true });
    const result = await applyAuditedProfileField(db, {
      actorId: 'actor-1',
      userId: 'user-1',
      column: 'rol_id',
      nextValue: '11111111-1111-1111-1111-111111111111',
    });
    assert.equal(result.changed, true);
    assert.equal(result.mode, 'transaction');
    assert.deepEqual(db.calls, [{
      type: 'rpc',
      name: 'admin_apply_profile_field',
      args: {
        p_user_id: 'user-1',
        p_column: 'rol_id',
        p_value: '11111111-1111-1111-1111-111111111111',
        p_actor: 'actor-1',
      },
    }]);
  });

  it('la configuración confirmada tampoco inserta el historial desde el cliente', async () => {
    const db = fakeDb({ rpcResult: { saved: ['contacto.soporte_email'] } });
    const result = await applyAuditedOrgSettings(db, 'actor-1', {
      'contacto.soporte_email': 'soporte@dralo.es',
    });
    assert.deepEqual(result.saved, ['contacto.soporte_email']);
    assert.equal(db.calls.some((call) => call.type === 'from'), false);
    assert.equal(db.calls[0].name, 'admin_apply_org_settings');
    assert.equal(db.calls[0].args.p_actor, 'actor-1');
  });
});

describe('migración de auditoría', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'scripts/migrations/admin_config_audit.sql'),
    'utf8',
  );

  it('detecta claves duplicadas y no borra filas', () => {
    assert.match(sql, /clave\(s\) duplicada/);
    assert.doesNotMatch(sql, /DELETE\s+FROM\s+public\.config_parametros/i);
    assert.doesNotMatch(sql, /DELETE\s+FROM\s+public\.config_log_cambios/i);
  });

  it('quita a los clientes la escritura del historial y de la configuración', () => {
    assert.match(sql, /REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.config_log_cambios FROM PUBLIC, anon, authenticated/);
    assert.match(sql, /REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.config_parametros FROM PUBLIC, anon, authenticated/);
    assert.match(sql, /actor no administrador/);
    assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.admin_apply_profile_field[\s\S]*TO anon/);
    assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.admin_apply_profile_field[\s\S]*TO authenticated/);
    assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.admin_apply_plan_change[\s\S]*TO authenticated/);
    assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.admin_apply_org_settings[\s\S]*TO authenticated/);
    assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.admin_apply_profile_field\(uuid, text, text, uuid\) TO service_role/);
  });

  it('cada función de cambio inserta el historial una sola vez', () => {
    const inserts = sql.match(/INSERT INTO public\.config_log_cambios/g) || [];
    assert.equal(inserts.length, 3);
    assert.match(sql, /IF prev IS NOT DISTINCT FROM p_value THEN\s+RETURN false/s);
    assert.match(sql, /IF prev IS NOT DISTINCT FROM p_plan THEN\s+RETURN false/s);
    assert.match(sql, /IF v_previous IS NOT DISTINCT FROM v_value THEN\s+CONTINUE/s);
  });
});

describe('respuesta de plan con Auth pendiente', () => {
  it('separa el plan guardado de la sincronización pendiente y no toca Stripe', () => {
    const pending = buildAdminPlanWriteResult({
      auditRecorded: true,
      authSynced: false,
      effective: {
        planSlug: 'friendly_plus',
        assignedPlanSlug: 'friendly_plus',
        source: 'admin',
        stripeStatus: null,
      },
    });
    assert.equal(pending.planSaved, true);
    assert.equal(pending.authSync, 'pending');
    assert.equal(pending.auditRecorded, true);
    assert.equal(pending.stripeChanged, false);
    assert.match(pending.authSyncDetail, /ya están guardados/);
    assert.equal(pending.error, undefined);

    const retry = buildAdminPlanWriteResult({
      auditRecorded: false,
      authSynced: true,
      effective: {
        planSlug: 'premium',
        assignedPlanSlug: 'free',
        source: 'stripe',
        stripeStatus: 'active',
      },
    });
    assert.equal(retry.planSaved, true);
    assert.equal(retry.authSync, 'synced');
    assert.equal(retry.auditRecorded, false);
    assert.equal(retry.stripeChanged, false);
    assert.equal(retry.effectivePlanFromStripe, true);
    assert.equal(retry.authSyncDetail, null);
  });
});

describe('accesos de webs', () => {
  it('exige el nombre y normaliza el correo', () => {
    assert.equal(validateAccesoWeb({ nombre: '  ' }).ok, false);
    const result = validateAccesoWeb({
      nombre: ' Stripe ',
      usuario: ' OPENTOWORK ',
      correo: ' Admin@Dralo.es ',
      contrasena: ' secreta ',
    });
    assert.equal(result.ok, true);
    assert.equal(result.value.nombre, 'Stripe');
    assert.equal(result.value.usuario, 'OPENTOWORK');
    assert.equal(result.value.correo, 'admin@dralo.es');
    assert.equal(result.value.contrasena, 'secreta');
    assert.equal(result.value.keepPassword, false);
  });

  it('al editar, una contraseña vacía conserva la guardada', () => {
    const result = validateAccesoWeb({ nombre: 'Stripe', contrasena: '' }, { editing: true });
    assert.equal(result.value.keepPassword, true);
  });

  it('guarda con la función del servidor y no escribe la tabla desde JavaScript', async () => {
    const calls = [];
    const db = {
      from() {
        throw new Error('no debe escribir la tabla');
      },
      async rpc(name, args) {
        calls.push({ name, args });
        if (name === 'admin_audit_ready') return { data: true, error: null };
        return { data: '11111111-1111-4111-8111-111111111111', error: null };
      },
    };
    const result = await saveAccesoWeb(db, 'actor-1', {
      nombre: 'Stripe',
      usuario: 'OPENTOWORK',
      correo: 'Admin@Dralo.es',
      contrasena: 'secreta',
    });
    assert.equal(result.id, '11111111-1111-4111-8111-111111111111');
    assert.equal(calls[0].name, 'admin_audit_ready');
    assert.equal(calls[1].name, 'admin_save_acceso_web');
    assert.equal(calls[1].args.p_actor, 'actor-1');
    assert.equal(calls[1].args.p_usuario, 'OPENTOWORK');
    assert.equal(calls[1].args.p_correo, 'admin@dralo.es');
    assert.equal(calls.some((call) => call.name === 'from'), false);
  });

  it('el historial no recibe la contraseña y el navegador no puede leer la tabla', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'scripts/migrations/admin_accesos_web.sql'),
      'utf8',
    );
    assert.match(sql, /REVOKE ALL ON TABLE public\.admin_accesos_web FROM PUBLIC, anon, authenticated/);
    assert.doesNotMatch(sql, /GRANT SELECT ON (TABLE )?public\.admin_accesos_web TO (anon|authenticated)/);
    assert.doesNotMatch(sql, /GRANT EXECUTE ON FUNCTION public\.admin_save_acceso_web[\s\S]*TO authenticated/);
    assert.match(sql, /'contrasena', v_id::text, NULL, 'Actualizada'/);
    assert.match(sql, /CASE WHEN v_has_password THEN 'Actualizada' ELSE NULL END/);
    const historyInserts = sql.split('INSERT INTO public.config_log_cambios').slice(1);
    for (const insert of historyInserts) {
      const statement = insert.split(';')[0];
      assert.doesNotMatch(statement, /p_contrasena|v_password/);
    }
  });
});

describe('correos con la configuración', () => {
  it('sin valores guardados conserva Dralo y no inventa la línea legal ni el mailto', () => {
    const { html } = buildBrandedEmailFromPlainText('Hola', {});
    assert.match(html, />Dralo</);
    assert.match(html, /Dralo English/);
    assert.doesNotMatch(html, /mailto:/);
    assert.doesNotMatch(html, /ETT OPEN TO WORK/);
  });

  it('escapa nombre, razón social y correo al meterlos en el HTML', () => {
    const { html } = buildBrandedEmailFromPlainText('Hola', {
      brandName: '<script>alert(1)</script>',
      legalName: 'A & B "SL"',
      supportEmail: 'soporte@dralo.es',
    });
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(html, /A &amp; B &quot;SL&quot;/);
    assert.match(html, /mailto:soporte@dralo\.es/);
  });
});
