'use client';

import SiteMascot from '@/components/SiteMascot';

export default function PanelPageHeader({
  title,
  subtitle,
  mascotVariant = 4,
  mascotWidth = 88,
  children,
  className = '',
}) {
  return (
    <div className={`panel-page-header ${className}`.trim()}>
      <div className="panel-page-header__brand">
        <SiteMascot
          variant={mascotVariant}
          width={mascotWidth}
          alt=""
          className="panel-page-header__mascot"
        />
        <div className="panel-page-header__text">
          <h1 className="panel-page-header__title">{title}</h1>
          {subtitle ? <p className="panel-page-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className="panel-page-header__actions">{children}</div> : null}
    </div>
  );
}
