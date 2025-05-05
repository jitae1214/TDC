import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "../../pages/main/ui";
import Login from "../../pages/login/ui";
import Signup from "../../pages/signup/ui";
import ApiTest from "../../pages/ApiTest";
import Profile from "../../pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import KakaoCallback from "../../pages/auth/KakaoCallback";
import GoogleCallback from "../../pages/auth/GoogleCallback";
import NaverCallback from "../../pages/auth/NaverCallback";

const AppRoutes = () => {
//BrowserRouter 가 뭘까...........
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Main/>}/>
                <Route path="/main" element={<Main/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/auth/kakao/callback" element={<KakaoCallback/>}/>
                <Route path="/auth/google/callback" element={<GoogleCallback/>}/>
                <Route path="/auth/naver/callback" element={<NaverCallback/>}/>
                <Route path="/api-test" element={
                    <ProtectedRoute>
                        <ApiTest/>
                    </ProtectedRoute>
                }/>
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile/>
                    </ProtectedRoute>
                }/>
            </Routes>
        </Router>
    );
}
export default AppRoutes;