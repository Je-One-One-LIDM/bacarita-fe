import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isAuthenticated: boolean;
    role: string | null;
    token: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    role: null,
    token: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLogin: (state, action: PayloadAction<{role: string; token:string}>) => {
            state.isAuthenticated = true;
            state.role = action.payload.role;
            state.token = action.payload.token;
        },
        setLogout: (state) => {
            state.isAuthenticated = false;
            state.role = null;
            state.token = null;
        }
    },
})

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;