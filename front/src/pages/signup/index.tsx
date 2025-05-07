import React from "react";
import { Link } from "react-router-dom";
import SignupForm from "./ui/SignupForm";

const Signup = () => {
    return (
        <div className="max-w-md mx-auto mt-10 p-6 shadow-md rounded-lg">
        <div className="mb-4">
        <Link to="/main" className="text-blue-500 underline">메인</Link> |{" "}
        <Link to="/login" className="text-blue-500 underline">로그인</Link>
        </div>
        <h2 className="text-xl font-bold mb-6">회원가입</h2>
        <SignupForm />
        </div>
);
};

export default Signup;