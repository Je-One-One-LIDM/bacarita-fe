import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import generalReducer from "./general.slice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        general: generalReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export default store; 
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;