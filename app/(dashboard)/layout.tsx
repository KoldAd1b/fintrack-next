import Header from "@/components/Header";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <main className="px-3 lg:px-14">
      <Header />
      {children}
    </main>
  );
};

export default Layout;
