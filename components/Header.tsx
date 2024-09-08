import React from "react";
import HeaderLogo from "./HeaderLogo";
import Navigation from "./Navigation";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import WelcomeMessage from "./WelcomeMessage";
import { Filters } from "./filters";
import ResetButton from "@/features/test/components/reset-button";
import GenerateButton from "@/features/test/components/generate-button";

type Props = {};

const Header = (props: Props) => {
  return (
    <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-8 lg:px-14 pb-36 ">
      <div className="max-w-screen-2xl mx-auto ">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="size-8 animate-spin text-slate-100" />
          </ClerkLoading>
        </div>
        <WelcomeMessage />
        <Filters />
        <div className="flex lg:block items-center w-full justify-center">
          <ResetButton />
          <GenerateButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
