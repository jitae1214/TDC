import React, {useState, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {register, checkUsernameAvailability, checkEmailAvailability} from "../api";
import "./styles.css";

const validate = {
    username: (username: string) => {
        if (!username.trim()) return "아이디를 입력해주세요.";
        if (username.length < 4) return "아이디는 4자 이상 입력해주세요.";
        return "";
    },
    password: (password: string, confirm: string) => {
        if (!password) return "비밀번호를 입력해주세요.";
        if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
        if (password !== confirm) return "비밀번호가 일치하지 않습니다.";
        return "";
    },
    email: (email: string) => {
        if (!email.trim()) return "이메일을 입력해주세요.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? "" : "이메일 형식이 올바르지 않습니다.";
    },
    fullName: (name: string) => (!name.trim() ? "이름을 입력해주세요." : ""),
    terms: (agreed: boolean) => (!agreed ? "이용약관에 동의해주세요." : ""),
};

const Signup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        email: "",
        fullName: "",
        nickname: "",
        agreeToTerms: false,
    });

    const [errors, setErrors] = useState({
        username: "",
        password: "",
        email: "",
        fullName: "",
        terms: "",
    });

    const [messages, setMessages] = useState({
        error: "",
        success: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: string, value: any) => {
        setForm({...form, [field]: value});
    };

    const checkUsername = async () => {
        const error = validate.username(form.username);
        if (error) {
            setErrors(prev => ({...prev, username: error}));
            return false;
        }
        try {
            const res = await checkUsernameAvailability(form.username);
            if (!res.available) {
                setErrors(prev => ({...prev, username: res.message || "사용 중인 아이디입니다."}));
                return false;
            }
            setErrors(prev => ({...prev, username: ""}));
            return true;
        } catch (error) {
            console.error("아이디 중복 확인 오류:", error);
            setErrors(prev => ({...prev, username: "서버 연결 중 오류가 발생했습니다."}));
            return false;
        }
    };

    const checkEmail = async () => {
        const error = validate.email(form.email);
        if (error) {
            setErrors(prev => ({...prev, email: error}));
            return false;
        }
        try {
            const res = await checkEmailAvailability(form.email);
            if (!res.available) {
                setErrors(prev => ({...prev, email: res.message || "이미 사용 중인 이메일입니다."}));
                return false;
            }
            setErrors(prev => ({...prev, email: ""}));
            return true;
        } catch (error) {
            console.error("이메일 중복 확인 오류:", error);
            setErrors(prev => ({...prev, email: "서버 연결 오류가 발생했습니다."}));
            return false;
        }
    };

    const validateForm = () => {
        const passwordErr = validate.password(form.password, form.passwordConfirm);
        const fullNameErr = validate.fullName(form.fullName);
        const termsErr = validate.terms(form.agreeToTerms);

        setErrors(prev => ({
            ...prev,
            password: passwordErr,
            fullName: fullNameErr,
            terms: termsErr,
        }));

        return !(passwordErr || fullNameErr || termsErr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const isUsernameValid = await checkUsername();
        const isEmailValid = await checkEmail();
        if (!isUsernameValid || !isEmailValid) return;

        try {
            setIsLoading(true);
            setMessages({error: "", success: ""});

            // 요청 데이터 준비
            const requestData = {
                username: form.username,
                password: form.password,
                email: form.email,
                fullName: form.fullName,
                nickname: form.nickname || undefined,
                agreeToTerms: form.agreeToTerms,
            };
            
            console.log("회원가입 요청 데이터:", requestData);

            const res = await register(requestData);
            console.log("회원가입 응답:", res);

            if (res.success) {
                // 사용자 이름을 로컬 스토리지에 직접 저장
                if (res.username) {
                    localStorage.setItem('username', res.username);
                    console.log('회원가입 성공: 사용자 이름 직접 저장됨', res.username);
                } else {
                    // 응답에 사용자 이름이 없는 경우 폼 데이터에서 가져와 저장
                    localStorage.setItem('username', form.username);
                    console.log('회원가입 성공: 폼 데이터에서 사용자 이름 저장됨', form.username);
                }
                
                // 닉네임이 있으면 저장
                if (form.nickname) {
                    localStorage.setItem('userNickname', form.nickname);
                }
                
                setMessages({success: "회원가입이 완료되었습니다. 이메일 인증 페이지로 이동합니다.", error: ""});
                setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(form.email)}`), 1500);
            } else {
                setMessages({error: res.message || "회원가입에 실패했습니다.", success: ""});
            }
        } catch (err) {
            console.error("회원가입 오류:", err);
            setMessages({error: "서버 연결 중 오류가 발생했습니다.", success: ""});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-nav">
                    <Link to="/main">메인</Link>
                    <Link to="/login">로그인</Link>
                </div>

                <h2 className="signup-title">회원가입</h2>

                {messages.error && <div className="signup-message error">{messages.error}</div>}
                {messages.success && <div className="signup-message success">{messages.success}</div>}

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="signup-form-field">
                        <label htmlFor="username">
                            아이디 <span className="required">*</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={form.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            onBlur={checkUsername}
                            placeholder="4자 이상의 아이디"
                        />
                        {errors.username && <div className="field-error">{errors.username}</div>}
                    </div>

                    <div className="signup-form-field">
                        <label htmlFor="password">
                            비밀번호 <span className="required">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            placeholder="8자 이상의 비밀번호"
                        />
                        {errors.password && <div className="field-error">{errors.password}</div>}
                    </div>

                    <div className="signup-form-field">
                        <label htmlFor="passwordConfirm">
                            비밀번호 확인 <span className="required">*</span>
                        </label>
                        <input
                            id="passwordConfirm"
                            type="password"
                            value={form.passwordConfirm}
                            onChange={(e) => handleChange("passwordConfirm", e.target.value)}
                            placeholder="비밀번호를 다시 입력해주세요"
                        />
                    </div>

                    <div className="signup-form-field">
                        <label htmlFor="email">
                            이메일 <span className="required">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            onBlur={checkEmail}
                            placeholder="example@email.com"
                        />
                        {errors.email && <div className="field-error">{errors.email}</div>}
                    </div>

                    <div className="signup-form-field">
                        <label htmlFor="fullName">
                            이름 <span className="required">*</span>
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={form.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            placeholder="실명을 입력해주세요"
                        />
                        {errors.fullName && <div className="field-error">{errors.fullName}</div>}
                    </div>

                    <div className="signup-form-field">
                        <label htmlFor="nickname">닉네임 (선택)</label>
                        <input
                            id="nickname"
                            type="text"
                            value={form.nickname}
                            onChange={(e) => handleChange("nickname", e.target.value)}
                            placeholder="다른 사용자에게 표시될 이름"
                        />
                    </div>

                    <div className="terms">
                        <input
                            id="agreeToTerms"
                            type="checkbox"
                            checked={form.agreeToTerms}
                            onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                        />
                        <label htmlFor="agreeToTerms">
                            <span className="required">*</span> 이용약관 및 개인정보 처리방침에 동의합니다.
                        </label>
                        {errors.terms && <div className="field-error">{errors.terms}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "처리 중..." : "회원가입"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
