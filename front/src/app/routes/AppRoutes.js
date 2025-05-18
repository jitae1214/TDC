import React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Main from "../../pages/main/ui";
import Login from "../../pages/login/ui";
import Signup from "../../pages/signup/ui/SignupForm";
import WorkspaceCreate from "../../pages/workspace/create";
import ProtectedRoute from "./ProtectedRoute";
import KakaoCallback from "../../pages/auth/KakaoCallback";
import GoogleCallback from "../../pages/auth/GoogleCallback";
import NaverCallback from "../../pages/auth/NaverCallback";
import EmailVerificationPage from "../../pages/EmailVerificationPage";
import WsMain from "../../pages/workspace/main/index"
import WsChat from "../../pages/workspace/chat/index";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/main" element={
                    <ProtectedRoute>
                        <Main/>
                    </ProtectedRoute>
                }/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/verify-email" element={<EmailVerificationPage/>}/>
                <Route path="/auth/kakao/callback" element={<KakaoCallback/>}/>
                <Route path="/auth/google/callback" element={<GoogleCallback/>}/>
                <Route path="/auth/naver/callback" element={<NaverCallback/>}/>
                <Route path="/workspace/create" element={
                    <ProtectedRoute>
                        <WorkspaceCreate/>
                    </ProtectedRoute>
                }/>
                <Route path="/workspace/:id/main" element={<WsMain/>}/>
                <Route path="/workspace/:id/chat" element={<WsChat/>}/>
                <Route path="/workspace/main" element={<WsMain/>}/>
                <Route path="/workspace/chat" element={<WsChat/>}/>
            </Routes>
        </Router>
    );
}
export default AppRoutes;