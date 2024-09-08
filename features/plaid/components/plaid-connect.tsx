"use client";

import { useMount } from "react-use";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCreateLinkToken } from "../api/use-create-link-token";
import { usePlaidLink } from "react-plaid-link";
import { useExchangePublicToken } from "../api/use-exchange-public-token";

export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null);
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();

  useMount(() => {
    createLinkToken.mutate(undefined, {
      // @ts-ignore
      onSuccess: ({ data }) => {
        console.log(data, "TOKEN");
        setToken(data);
      },
    });
  });

  const plaid = usePlaidLink({
    token,
    onSuccess: (token) => {
      exchangePublicToken.mutate({
        publicToken: token,
      });
    },
    env: "sandbox",
  });

  const onClick = () => {
    plaid.open();
  };

  const isDisabled = !plaid.ready || exchangePublicToken.isPending;

  return (
    <Button
      onClick={onClick}
      size={"sm"}
      variant={"ghost"}
      disabled={isDisabled}
    >
      Connect
    </Button>
  );
};
