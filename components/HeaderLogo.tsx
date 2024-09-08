import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {};

const HeaderLogo = (props: Props) => {
  return (
    <Link href={"/"}>
      <div className="items-center hidden lg:flex ">
        <Image src={"/company-logo.svg"} alt="Logo" height={28} width={28} />
        <p className="font-semibold text-white text-2xl ml-2.5">FinTrack</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
