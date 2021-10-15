import React from "react";
import Link from "next/link";

interface Props {}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="page">
      <Link href="/">
        <a className="logo">
          <img src="/logo.png" alt="logo"></img>
        </a>
      </Link>
      {children}
    </div>
  );
};

export default Layout;
