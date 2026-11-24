export default function PracticeSsrHeading({ title, subtitle, note }) {
  return (
    <header className="levels-b2-practice__header" data-practice-ssr-heading="">
      <h1 className="levels-b2-practice__title">{title}</h1>
      {subtitle ? <p className="levels-b2-practice__subtitle">{subtitle}</p> : null}
      {note ? <p>{note}</p> : null}
    </header>
  );
}
