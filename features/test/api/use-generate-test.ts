import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGenerateTestData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await client.api.test["generate"].$post();

      if (!response.ok) {
        const error = Error("Failed to generate the transactions");
        // @ts-expect-error
        error.status = response.status;
        throw error;
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Transactions generated");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: any) => {
      if (error.status === 403) {
        toast.error("You have already generated test transactions");
      } else {
        toast.error("Failed to generate the transactions");
      }
    },
  });
};
