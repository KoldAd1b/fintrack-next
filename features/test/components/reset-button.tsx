"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useResetData } from "../api/use-reset-database";
import useConfirm from "@/hooks/use-confirm";
import clsx from "clsx";

type Props = {};

const ResetButton = (props: Props) => {
  const resetMutation = useResetData();
  const [ConfirmationDialog, confirm] = useConfirm(
    "Caution",
    "You are about to delete everything, including your accounts and transactions"
  );

  const onClick = async () => {
    const ok = await confirm();

    if (ok) {
      resetMutation.mutate();
    } else {
      return;
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <Button
        variant={"destructive"}
        onClick={onClick}
        disabled={resetMutation.isPending}
        className={clsx(
          "mt-4 mx-4 lg:mx-0",
          resetMutation.isPending && "animate-pulse"
        )}
      >
        Reset your data
      </Button>
    </>
  );
};

export default ResetButton;
