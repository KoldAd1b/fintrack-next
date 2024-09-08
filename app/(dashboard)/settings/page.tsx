import React from "react";
import SettingsCard from "./components/settings-card";

type Props = {};

const SettingsPage = (props: Props) => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <SettingsCard />
    </div>
  );
};

export default SettingsPage;
