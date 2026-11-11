import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_AUTOMATED_EMAIL_TEMPLATES } from '@/lib/automatedEmailDefaults';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { buildBrandedEmailFromPlainText } from '@/lib/emailBrandedLayout';
import { renderEmailTemplate, splitEmailDeliveryMeta } from '@/lib/renderEmailTemplate';
import { listAdminAndMarketingEmails } from '@/lib/staffNoticeRecipients';

function tableClient({ roles, users, failTable }) {
  return {
    from(table) {
      let roleFilter = null;
      const payload = () => {
        if (failTable && table === failTable) return { data: null, error: { message: 'fallo' } };
        if (String(table).includes('roles')) return { data: roles, error: null };
        const rows = roleFilter
          ? (users || []).filter((user) => roleFilter.includes(user.rol_id))
          : users;
        return { data: rows, error: null };
      };
      const api = {
        select() {
          return api;
        },
        in(_column, ids) {
          roleFilter = ids;
          return api;
        },
        eq() {
          return api;
        },
        then(resolve, reject) {
          return Promise.resolve(payload()).then(resolve, reject);
        },
      };
      return api;
    },
  };
}

test('admin and marketing emails include active staff and the direction inbox', async () => {
  const emails = await listAdminAndMarketingEmails(
    tableClient({
      roles: [
        { id: 1, nombre: 'admin' },
        { id: 2, nombre: 'Resp.marketing' },
        { id: 3, nombre: 'alumno' },
        { id: 4, nombre: 'profesor' },
      ],
      users: [
        { email: 'Ana@Dralo.es', activo: true, rol_id: 1 },
        { email: 'marketing@dralo.es', activo: true, rol_id: 2 },
        { email: 'baja@dralo.es', activo: false, rol_id: 1 },
        { email: 'alumno@dralo.es', activo: true, rol_id: 3 },
        { email: 'profe@dralo.es', activo: true, rol_id: 4 },
      ],
    }),
  );

  assert.deepEqual(emails.sort(), [
    'ana@dralo.es',
    'direccion@opentowork.com',
    'marketing@dralo.es',
  ]);
});

test('a failed staff lookup still keeps the direction inbox', async () => {
  const emails = await listAdminAndMarketingEmails(
    tableClient({ roles: [], users: [], failTable: 'Usuarios_y_Perfil_roles' }),
  );
  assert.deepEqual(emails, ['direccion@opentowork.com']);
});

test('review and ticket notices render the user content and a panel link', () => {
  const review = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find((item) => item.slug === 'admin_review_notice');
  const ticket = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find(
    (item) => item.slug === 'admin_support_ticket_notice',
  );
  assert.equal(review.trigger_event, AUTOMATED_EMAIL_TRIGGERS.ADMIN_REVIEW_NOTICE);
  assert.equal(ticket.trigger_event, AUTOMATED_EMAIL_TRIGGERS.ADMIN_SUPPORT_TICKET_NOTICE);
  assert.equal(review.delay_minutos, 0);
  assert.equal(ticket.delay_minutos, 0);

  const reviewBody = splitEmailDeliveryMeta(
    renderEmailTemplate(review.cuerpo, {
      nombre: 'Lucía',
      email: 'lucia@example.com',
      estrellas: '5 de 5',
      resena: 'Practico cada semana y se nota.',
      action_url: 'https://www.dralo.es/soporte/correos/',
    }),
  );
  assert.equal(reviewBody.ctaLabel, 'Ver reseñas');
  assert.match(reviewBody.text, /Lucía/);
  assert.match(reviewBody.text, /5 de 5/);
  assert.match(reviewBody.text, /Practico cada semana/);
  const reviewHtml = buildBrandedEmailFromPlainText(reviewBody.text, { ctaLabel: reviewBody.ctaLabel });
  assert.match(reviewHtml.html, /https:\/\/www\.dralo\.es\/soporte\/correos\//);
  assert.match(reviewHtml.html, /Ver reseñas/);

  const ticketBody = splitEmailDeliveryMeta(
    renderEmailTemplate(ticket.cuerpo, {
      nombre: 'Marcos',
      email: 'marcos@example.com',
      ticket_subject: 'No puedo entrar',
      message: 'Me sale un error al iniciar sesión.',
    }),
  );
  assert.equal(ticketBody.ctaLabel, '');
  assert.match(ticketBody.text, /No puedo entrar/);
  assert.match(ticketBody.text, /Me sale un error al iniciar sesión/);
  const ticketHtml = buildBrandedEmailFromPlainText(ticketBody.text, { ctaLabel: ticketBody.ctaLabel });
  assert.match(ticketHtml.html, /Me sale un error al iniciar sesión/);
  assert.match(ticketHtml.html, /marcos@example.com/);
});

test('registration notice includes confirmation, the form, the source and the profile link', () => {
  const template = DEFAULT_AUTOMATED_EMAIL_TEMPLATES.find(
    (item) => item.slug === 'admin_registration_notice',
  );
  assert.equal(template.trigger_event, AUTOMATED_EMAIL_TRIGGERS.ADMIN_REGISTRATION_NOTICE);
  const body = splitEmailDeliveryMeta(
    renderEmailTemplate(template.cuerpo, {
      nombre: 'Lucía',
      email: 'lucia@example.com',
      correo_confirmado: 'Sí',
      formulario: 'Todavía no',
      origen: 'Anuncio Meta',
      action_url: 'https://www.dralo.es/admin/usuarios/user-1/',
    }),
  );
  assert.equal(body.ctaLabel, 'Ver ficha');
  assert.match(body.text, /Correo confirmado: Sí/);
  assert.match(body.text, /Formulario: Todavía no/);
  assert.match(body.text, /Llegó desde: Anuncio Meta/);
  const html = buildBrandedEmailFromPlainText(body.text, { ctaLabel: body.ctaLabel });
  assert.match(html.html, /https:\/\/www\.dralo\.es\/admin\/usuarios\/user-1\//);
  assert.match(html.html, /Ver ficha/);
});
