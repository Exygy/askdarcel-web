import React from "react";

// Purpose is to add a <main> section to every page and for "Skip to main content" button for improved UX / a11y.

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = (props: PageWrapperProps) => {
  const { children } = props;

  return <main id="main">{children}</main>;
};

export default PageWrapper;
