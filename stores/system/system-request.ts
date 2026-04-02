import { SystemConfig } from "@/types/system.type";
import { Base } from "../base";

export class SystemRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  async getSystem(): Promise<{ data: SystemConfig }> {
    return this.request("/api/system", {
      method: "GET",
    });
  }

  async updateSystem(data: Partial<Omit<SystemConfig, "id" | "updatedAt">>): Promise<{ data: SystemConfig }> {
    return this.request("/api/system", {
      method: "PATCH",
      data,
    });
  }
}

export const systemRequest = new SystemRequest();
