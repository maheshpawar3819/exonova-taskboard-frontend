import {configureStore} from "@reduxjs/toolkit"
import authReducer from "../features/authSlice"
import boardReducer from "../features/boardSlice"

export const store=configureStore({
    reducer:{
        auth : authReducer,
        board : boardReducer
    }
})