"use client";

import { useMount } from "react-use";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDeleteConnectedBank } from "../api/use-delete-connected-bank";

import { usePlaidLink } from "react-plaid-link";
import useConfirm from "@/hooks/use-confirm";
import { Dialog } from "@/components/ui/dialog";

export const PlaidDisconnect = () => {
  const [ConfirmationDialog, confirm] = useConfirm(
    "Are you sure",
    "This will disconnect your bank account and remove all associated data"
  );
  const deleteConnectedBank = useDeleteConnectedBank();

  const onClick = async () => {
    const ok = await confirm();
    if (ok) {
      deleteConnectedBank.mutate();
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <Button
        onClick={onClick}
        size={"sm"}
        variant={"ghost"}
        disabled={deleteConnectedBank.isPending}
      >
        Disconnect
      </Button>
    </>
  );
};
