import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, checkUsernameAvailability, checkEmailAvailability } from "../../../api/authService";

// 유효성 검사 함수들
const validateUsername = (username: string) => {
    if (!username.trim()) {
        return "아이디를 입력해주세요.";
    }
    if (username.length < 4) {
        return "아이디는 4자 이상 입력해주세요.";
    }
    return "";
};

const validatePassword = (password: string, passwordConfirm: string) => {
    if (!password) {
        return "비밀번호를 입력해주세요.";
    }
    if (password.length < 8) {
        return "비밀번호는 8자 이상이어야 합니다.";
    }
    if (password !== passwordConfirm) {
        return "비밀번호가 일치하지 않습니다.";
    }
    return "";
};

const validateEmail = (email: string) => {
    if (!email.trim()) {
        return "이메일을 입력해주세요.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "이메일 형식이 올바르지 않습니다.";
    }
    return "";
};

const validateFullName = (fullName: string) => {
    if (!fullName.trim()) {
        return "이름을 입력해주세요.";
    }
    return "";
};

const validateTerms = (agreeToTerms: boolean) => {
    if (!agreeToTerms) {
        return "이용약관에 동의해주세요.";
    }
    return "";
};

const Signup = () => {
    const navigate = useNavigate();

    // 회원가입 폼
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // 유효성 검사
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [fullNameError, setFullNameError] = useState("");
    const [termsError, setTermsError] = useState("");

    // 서버 응답 상태
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 아이디 중복 확인
    const checkUsername = async () => {
        const error = validateUsername(username);
        if (error) {
            setUsernameError(error);
            return false;
        }

        try {
            const response = await checkUsernameAvailability(username);
            if (!response.available) {
                setUsernameError(response.message || "사용 중인 아이디입니다.");
                return false;
            }
            setUsernameError("");
            return true;
        } catch (error) {
            setUsernameError("서버 연결 중 오류가 발생했습니다.");
            return false;
        }
    };

    // 이메일 중복 확인
    const checkEmail = async () => {
        const error = validateEmail(email);
        if (error) {
            setEmailError(error);
            return false;
        }

        try {
            const response = await checkEmailAvailability(email);
            if (!response.available) {
                setEmailError(response.message || "이미 사용 중인 이메일입니다.");
                return false;
            }
            setEmailError("");
            return true;
        } catch (error) {
            setEmailError("서버 연결 오류가 발생했습니다.");
            return false;
        }
    };

    // 폼 유효성 검사
    const validateForm = () => {
        let isValid = true;

        // 각 필드별 유효성 검사
        const passwordValidationError = validatePassword(password, passwordConfirm);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            isValid = false;
        } else {
            setPasswordError("");
        }

        const fullNameValidationError = validateFullName(fullName);
        if (fullNameValidationError) {
            setFullNameError(fullNameValidationError);
            isValid = false;
        } else {
            setFullNameError("");
        }

        const termsValidationError = validateTerms(agreeToTerms);
        if (termsValidationError) {
            setTermsError(termsValidationError);
            isValid = false;
        } else {
            setTermsError("");
        }

        return isValid;
    };

    // 회원가입 제출 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 기본 유효성 검사
        if (!validateForm()) {
            return;
        }

        // 아이디 및 이메일 중복 검사
        const isUsernameValid = await checkUsername();
        const isEmailValid = await checkEmail();

        if (!isUsernameValid || !isEmailValid) {
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            // 회원가입 API 호출
            const response = await register({
                username,
                password,
                email,
                fullName,
                nickname: nickname || undefined,
                agreeToTerms
            });

            if (response.success) {
                setSuccessMessage("회원가입이 완료되었습니다. 이메일 인증 후 로그인할 수 있습니다.");
                // 3초 후 로그인 페이지로 이동
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setErrorMessage(response.message || "회원가입에 실패했습니다.");
            }
        } catch (error) {
            setErrorMessage("서버 연결 중 오류가 발생했습니다.");
            console.error("회원가입 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <Link to="/main">메인으로 가기</Link>
                <Link to="/login">로그인으로 가기</Link>
            </div>

            <h2>회원가입</h2>

            {errorMessage && <div>{errorMessage}</div>}
            {successMessage && <div>{successMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>아이디 *</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={checkUsername}
                    />
                    {usernameError && <div>{usernameError}</div>}
                </div>

                <div>
                    <label>비밀번호 *</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div>8자 이상 입력.</div>
                </div>

                <div>
                    <label>비밀번호 확인 *</label>
                    <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    {passwordError && <div>{passwordError}</div>}
                </div>

                <div>
                    <label>이메일 *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={checkEmail}
                    />
                    {emailError && <div>{emailError}</div>}
                </div>

                <div>
                    <label>이름 *</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    {fullNameError && <div>{fullNameError}</div>}
                </div>

                <div>
                    <label>닉네임 (선택)</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                        이용약관에 동의합니다. *
                    </label>
                    {termsError && <div>{termsError}</div>}
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "가입 중..." : "회원가입"}
                </button>
            </form>
        </div>
    );
};

export default Signup;
