import { useMutation } from "@tanstack/react-query";
import { lookupNid } from "../api/nidClient";
import { createNidRequest, updateNidRequestStatus } from "../api/requestsLog";
import type { NidLookupRequest } from "../types";

export const useNidLookup = () =>
  useMutation({
    mutationKey: ["nid-lookup"],
    mutationFn: async (input: NidLookupRequest & { email?: string }) => {
      const requestId = await createNidRequest(input.nid_number, input.date_of_birth, input.email);
      try {
        const result = await lookupNid({
          nid_number: input.nid_number,
          date_of_birth: input.date_of_birth,
        });
        await updateNidRequestStatus(requestId, "success");
        return result;
      } catch (err) {
        await updateNidRequestStatus(
          requestId,
          "failed",
          err instanceof Error ? err.message : "unknown error",
        );
        throw err;
      }
    },
  });
