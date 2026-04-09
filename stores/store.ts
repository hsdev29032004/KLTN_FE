import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import authReducer from "./auth/auth-slice";
import notificationReducer from "./notification/notification.slice";
import courseReducer from "./course/course-slice";
import purchaseReducer from "./purchase/purchase-slice";
import appReducer from "./app/app-slice";
import bankReducer from "./bank/bank-slice";
import statReducer from "./stat/stat-slice";
import reviewReducer from "./review/review-slice";
import systemReducer from "./system/system-slice";
import invoiceReducer from "./invoice/invoice-slice";
import paymentReducer from "./payment/payment-slice";
import conversationReducer from "./conservation/conservation-slice";
import cartReducer from "./cart/cart-slice";

const rootReducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
  course: courseReducer,
  purchase: purchaseReducer,
  app: appReducer,
  bank: bankReducer,
  stat: statReducer,
  review: reviewReducer,
  system: systemReducer,
  invoice: invoiceReducer,
  payment: paymentReducer,
  conversation: conversationReducer,
  cart: cartReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const reducer = (state: any, action: any) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state,
      ...action.payload,
    };
    return nextState;
  } else {
    return rootReducer(state, action);
  }
};

export const makeStore = () =>
  configureStore({
    reducer,
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export const wrapper = createWrapper<AppStore>(makeStore, { debug: false });
