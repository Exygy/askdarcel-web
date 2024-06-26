import React from "react";
import classNames from "classnames";
import styles from "./Button.module.scss";

type ButtonType = "button" | "submit" | "reset";
type StyleType = "transparent" | "text" | "default";
type SizeType = "xs" | "sm" | "base" | "lg" | "xl";
type VariantType = "primary" | "secondary" | "linkBlue" | "linkWhite";

export const Button = ({
  children,
  onClick,
  buttonType = "button",
  addClass,
  styleType = "default",
  size = "base",
  variant = "primary",
  arrowVariant,
  tabIndex,
  disabled,
  href,
  mobileFullWidth = true,
}: {
  children: string | JSX.Element;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  readonly buttonType?: ButtonType;
  addClass?: string; // phase out as we replace old buttons with new
  styleType?: StyleType; // phase out as we replace old buttons with new
  size?: SizeType;
  variant?: VariantType;
  tabIndex?: number;
  disabled?: boolean;
  arrowVariant?: "before" | "after";
  href?: string;
  mobileFullWidth?: boolean;
}) => {
  const buttonClass = classNames(
    styles.button,
    styles[`button--${styleType}`],
    styles[`button--${size}`],
    styles[`button--${variant}`],
    styles[`button--arrow-${arrowVariant}`],

    {
      [styles["mobile-full-width"]]: mobileFullWidth,
      [`${styles["button--link"]} ${styles[`button--link-${variant}`]}`]: href,
    }
  );

  // Links that follow same visual guidelines as buttons
  if (href) {
    const isExternalLink = !href.startsWith("/");

    const linkProps = isExternalLink && { target: "_blank", rel: "noreferrer" };
    return (
      <a href={href} className={buttonClass} {...linkProps}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      // ES Lint complains about the type attr being set dynamically, but given that type attr is
      // limited to ButtonType enums, commenting this out should be safe
      /* eslint-disable-next-line react/button-has-type */
      type={buttonType}
      tabIndex={tabIndex}
      className={`${buttonClass} ${addClass || ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
