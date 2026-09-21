import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import "./page-header.css";

export type PageHeaderProps = Omit<ComponentPropsWithoutRef<"header">, "children"> & {
  breadcrumb: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  actions,
  breadcrumb,
  className,
  description,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header {...props} className={clsx("mfd-page-header", className)}>
      {breadcrumb}
      <div className="mfd-page-header__main">
        <div className="mfd-page-header__copy">
          <h1>{title}</h1>
          {description ? <p className="mfd-page-header__description">{description}</p> : null}
        </div>
        {actions ? <div className="mfd-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
