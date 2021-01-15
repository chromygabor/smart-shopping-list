/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useRouter } from "next/router";
import NextLink from "next/link";
import MuiLink from "@material-ui/core/Link";

interface INextComposed {
  as: string | {};
  href: string | {};
  prefetch: boolean;
  className: string;
}

const NextComposed = React.forwardRef<HTMLAnchorElement, INextComposed>(
  ({ as, href, ...other }: INextComposed, ref) => {
    return (
      <NextLink href={href} as={as}>
        <a ref={ref} {...other} />
      </NextLink>
    );
  }
);

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link

export interface IMyLinkProps {
  activeClassName?: string;
  as: string | {};
  className: string;
  href: string | (string & { pathname: string });
  innerRef: () => any | {};
  naked: boolean;
  onClick: () => void;
  prefetch: boolean;
}

const Link: React.FC<IMyLinkProps> = ({
  href,
  activeClassName = "active",
  className: classNameProps,
  innerRef,
  naked,
  ...other
}: IMyLinkProps) => {
  const router = useRouter();
  const pathname = typeof href === "string" ? href : href.pathname;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  if (naked) {
    return (
      <NextComposed
        className={className}
        ref={innerRef}
        href={href}
        {...other}
      />
    );
  }

  return (
    <MuiLink
      component={NextComposed}
      className={className}
      ref={innerRef}
      href={href}
      {...other}
    />
  );
};

export default React.forwardRef<HTMLAnchorElement, any>((props, ref) => (
  <Link {...props} innerRef={ref} />
));
