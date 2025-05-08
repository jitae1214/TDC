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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        email: "",
        fullName: "",
        nickname: "",
        profileImage: "",
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
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleChange = (field: string, value: any) => {
        setForm({...form, [field]: value});
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // 파일 크기 검사 (5MB 이하)
        if (file.size > 5 * 1024 * 1024) {
            setMessages({...messages, error: "이미지 크기는 5MB 이하여야 합니다."});
            return;
        }
        
        // 파일 형식 검사
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            setMessages({...messages, error: "JPG, PNG, GIF, WEBP 형식만 지원합니다."});
            return;
        }
        
        // 이미지 미리보기
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreviewImage(result);
            handleChange('profileImage', result);
            
            // 일반 회원가입 프로필 이미지를 별도의 키로 로컬 스토리지에 저장
            localStorage.setItem('signupProfileImage', result);
        };
        reader.readAsDataURL(file);
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

            // 요청 데이터 준비 - 프로필 이미지 처리 최적화
            let profileImageToSend = undefined;
            if (form.profileImage && form.profileImage.length > 0) {
                // 프로필 이미지가 있는 경우 Base64 데이터 길이 체크
                if (form.profileImage.length > 5 * 1024 * 1024) { // 대략적인 5MB 체크
                    setMessages({error: "프로필 이미지가 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.", success: ""});
                    setIsLoading(false);
                    return;
                }
                profileImageToSend = form.profileImage;
            }
            
            // 요청 데이터 로깅
            const requestData = {
                username: form.username,
                password: form.password,
                email: form.email,
                fullName: form.fullName,
                nickname: form.nickname || undefined,
                profileImage: profileImageToSend,
                agreeToTerms: form.agreeToTerms,
            };
            console.log("회원가입 요청 데이터:", {...requestData, profileImage: profileImageToSend ? "이미지 데이터 (생략)" : undefined});

            // 먼저 프로필 이미지 없이 시도
            const res = await register({
                ...requestData,
                profileImage: undefined // 우선 프로필 이미지 없이 시도
            });
            console.log("회원가입 응답:", res);

            if (res.success) {
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

    // 파일 선택 다이얼로그 열기
    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 프로필 이미지 제거
    const removeProfileImage = () => {
        setPreviewImage(null);
        handleChange('profileImage', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // 로컬 스토리지에서도 제거
        localStorage.removeItem('signupProfileImage');
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
                    {/* 프로필 이미지 업로드 영역 */}
                    <div className="profile-image-upload">
                        <label>프로필 이미지 (선택)</label>
                        <div className="profile-image-container">
                            {previewImage ? (
                                <div className="profile-preview">
                                    <img 
                                        src={previewImage} 
                                        alt="프로필 미리보기" 
                                        className="profile-preview-image"
                                    />
                                    <button 
                                        type="button" 
                                        className="remove-image-btn"
                                        onClick={removeProfileImage}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="profile-placeholder"
                                    onClick={openFileDialog}
                                >
                                    <span className="upload-icon">➕</span>
                                    <span>이미지 선택</span>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            style={{ display: 'none' }} 
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            onChange={handleImageUpload}
                        />
                        <div className="extra">JPG, PNG, GIF, WEBP 형식, 최대 5MB</div>
                    </div>

                    {[
                        {label: "아이디 *", name: "username", type: "text", onBlur: checkUsername, error: errors.username},
                        {label: "비밀번호 *", name: "password", type: "password", extra: "8자 이상 입력."},
                        {label: "비밀번호 확인 *", name: "passwordConfirm", type: "password", error: errors.password},
                        {label: "이메일 *", name: "email", type: "email", onBlur: checkEmail, error: errors.email},
                        {label: "이름 *", name: "fullName", type: "text", error: errors.fullName},
                        {label: "닉네임 (선택)", name: "nickname", type: "text"},
                    ].map(({label, name, type, onBlur, extra, error}) => (
                        <div key={name}>
                            <label>{label}</label>
                            <input
                                type={type}
                                value={(form as any)[name]}
                                onChange={(e) => handleChange(name, e.target.value)}
                                onBlur={onBlur}
                            />
                            {extra && <div className="extra">{extra}</div>}
                            {error && <div className="field-error">{error}</div>}
                        </div>
                    ))}

                    <div className="terms">
                        <label>
                            <input
                                type="checkbox"
                                checked={form.agreeToTerms}
                                onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                            />
                            이용약관에 동의합니다. *
                        </label>
                        {errors.terms && <div className="field-error">{errors.terms}</div>}
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "가입 중..." : "회원가입"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
