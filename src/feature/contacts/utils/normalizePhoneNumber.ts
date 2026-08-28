import useUserStore from "@/src/store/useUserStore";
import { getCountryByPhoneNumber } from "rn-international-phone-number";

export function normalizePhoneNumber(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  const ownNumber = useUserStore.getState().user?.phoneNumber;
  const dialCode = (ownNumber ? getCountryByPhoneNumber(ownNumber) : undefined)?.idd?.root ?? "";
  const withoutTrunkZero = cleaned.replace(/^0+/, "");

  return dialCode ? `${dialCode}${withoutTrunkZero}` : cleaned;
}
