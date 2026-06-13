import { useMutation } from "@tanstack/react-query";
import { lookupNid } from "../api/nidClient";
import type { NidLookupRequest } from "../types";

export const useNidLookup = () =>
  useMutation({
    mutationKey: ["nid-lookup"],
    mutationFn: (input: NidLookupRequest) => lookupNid(input),
  });
