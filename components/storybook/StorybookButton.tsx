"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useStorybook } from "./StorybookProvider";

type StorybookButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Desktop page index (from buildPages) where the book should open. */
  page?: number;
  /** Preferred over `page`; resolved against the current (mobile/desktop) model. */
  photoKey?: string;
  children: ReactNode;
};

export default function StorybookButton({
  page = 0,
  photoKey,
  children,
  onClick,
  ...rest
}: StorybookButtonProps) {
  const { open } = useStorybook();

  return (
    <button
      type="button"
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        open(page, photoKey);
      }}
    >
      {children}
    </button>
  );
}
