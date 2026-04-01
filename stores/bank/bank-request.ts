import { Bank } from "@/types/bank.type";
import { Base } from "../base";

export class BankRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getBanks(): Promise<{ data: Bank[] }> {
    return this.request("/api/system/banks", {
      method: "GET",
    });
  }
}

export const bankRequest = new BankRequest();
