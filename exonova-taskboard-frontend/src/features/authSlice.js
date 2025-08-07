import {createSlice} from "@reduxjs/toolkit"

const userInfo=JSON.parse(localStorage.getItem("user"));

const authSlice=createSlice({
    name : "auth",
    initialState:{
        user : userInfo || null
    },
    reducers:{
        login : (state,action) => {
            state.user = action.payload;
            localStorage.setItem('user',JSON.stringify(action.payload));
        },
        logout:(state) => {
            state.user=null;
            localStorage.removeItem("user");
        }
    }
})

export const {login,logout}=authSlice.actions;
export default authSlice.reducer;