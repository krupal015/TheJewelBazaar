function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl space-y-3">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl text-pearl sm:text-4xl">{title}</h2>
        {description ? <p className="text-sm leading-7 text-smoke sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default SectionHeading;
