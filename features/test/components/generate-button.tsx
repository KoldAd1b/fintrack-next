"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useGenerateTestData } from "../api/use-generate-test";
import clsx from "clsx";

type Props = {};

const GenerateButton = (props: Props) => {
  const generateMutation = useGenerateTestData();

  const onClick = async () => {
    generateMutation.mutate();
  };
  return (
    <Button
      onClick={onClick}
      disabled={generateMutation.isPending}
      className={clsx(
        "mt-4 mx-4",
        generateMutation.isPending && "animate-pulse"
      )}
    >
      Generate Test Data
    </Button>
  );
};

export default GenerateButton;
