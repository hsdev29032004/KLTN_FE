import { Base } from "../base";

export class PurchaseRequest extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }
}

export const purchaseRequest = new PurchaseRequest();
