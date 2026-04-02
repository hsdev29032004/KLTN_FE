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

  async createBank(data: Omit<Bank, "id" | "createdAt" | "updatedAt">): Promise<{ data: Bank }> {
    return this.request("/api/system/banks", {
      method: "POST",
      data,
    });
  }

  async updateBank(id: string, data: Partial<Omit<Bank, "id" | "createdAt" | "updatedAt">>): Promise<{ data: Bank }> {
    return this.request(`/api/system/banks/${id}`, {
      method: "PATCH",
      data,
    });
  }

  async deleteBank(id: string): Promise<void> {
    return this.request(`/api/system/banks/${id}`, {
      method: "DELETE",
    });
  }
}

export const bankRequest = new BankRequest();
