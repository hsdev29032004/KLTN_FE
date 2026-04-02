import { AuthRequest } from './auth/auth-request';
import { Base } from './base';
import { CourseRequest } from './course/course-request';
import { BankRequest } from './bank/bank-request';
import { PurchaseRequest } from './purchase/purchase-request';
import { StatRequest } from './stat/stat-request';
import { ConversationRequest } from './conservation/conservation-request';

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        baseCtor.prototype,
        name,
      );
      if (descriptor) {
        Object.defineProperty(derivedCtor.prototype, name, descriptor);
      }
    });
  });
}

class SDK extends Base {
  constructor(accessToken?: string, refreshToken?: string) {
    super(accessToken, refreshToken);
  }

  private static _instance: SDK;
  public static getInstance(): SDK {
    const isClientSide = typeof window !== 'undefined';
    if (!isClientSide) {
      throw new Error('SDK singleton is only available on the client side.');
    }
    if (!this._instance) {
      this._instance = new this();
    }
    return this._instance;
  }

  public static setInstance(access_token?: string, refresh_token?: string) {
    this._instance = new this(access_token, refresh_token);
    this._instance.updateTokens(access_token, refresh_token);
  }
}

interface SDK
  extends
    AuthRequest,
    CourseRequest,
    BankRequest,
    PurchaseRequest,
    StatRequest,
    ConversationRequest {}
applyMixins(SDK, [
  AuthRequest,
  CourseRequest,
  BankRequest,
  PurchaseRequest,
  StatRequest,
  ConversationRequest,
]);

export default SDK;
