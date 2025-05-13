import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {getCurrentUser, logout} from '../api/authService';

const Profile: React.FC = () => {
    // 모든 가능한 방법으로 사용자 이름 가져오기 시도
    const usernameFromFunction = getCurrentUser();
    const usernameFromLocalStorage = localStorage.getItem('username');
    const usernameFromLocalStorageAlt = localStorage.getItem('AUTH_USERNAME_KEY');
    
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(usernameFromFunction || usernameFromLocalStorage || usernameFromLocalStorageAlt || null);
    
    // 디버깅을 위해 즉시 콘솔로 상태 확인
    console.log('===== 사용자 정보 상태 확인 =====');
    console.log('usernameFromFunction:', usernameFromFunction);
    console.log('usernameFromLocalStorage:', usernameFromLocalStorage);
    console.log('usernameFromLocalStorageAlt:', usernameFromLocalStorageAlt);
    console.log('초기 userId 상태:', userId);
    
    useEffect(() => {
        // 초기화 직후 모든 로컬 스토리지 데이터 로깅
        console.log('===== 사용자 정보 디버깅 =====');
        console.log('getCurrentUser 결과:', getCurrentUser());
        console.log('localStorage username:', localStorage.getItem('username'));
        console.log('localStorage token:', localStorage.getItem('token') ? '존재함' : '없음');
        console.log('localStorage userNickname:', localStorage.getItem('userNickname'));
        console.log('sessionStorage token:', sessionStorage.getItem('token') ? '존재함' : '없음');
        console.log('=============================');
        
        // 강제로 localStorage 접근 시도
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                console.log(`localStorage[${key}] =`, localStorage.getItem(key));
            }
        }
        
        // 사용자 ID가 없으면 로컬 스토리지에서 다시 확인
        if (!userId) {
            // 다양한 키로 저장된 사용자 ID 확인
            const possibleUserIds = [
                localStorage.getItem('username'),
                localStorage.getItem('AUTH_USERNAME_KEY'),
                sessionStorage.getItem('username'),
                getCurrentUser()
            ].filter(Boolean);
            
            if (possibleUserIds.length > 0) {
                const foundUserId = possibleUserIds[0];
                console.log('다른 소스에서 사용자 ID 복구:', foundUserId);
                setUserId(foundUserId);
                
                // 로컬 스토리지에 저장
                if (!localStorage.getItem('username') && foundUserId) {
                    localStorage.setItem('username', foundUserId);
                }
            }
        }

        // 현재 로그인 사용자가 소셜 로그인 사용자인지 확인
        const isSocialLogin = userId && (
            userId.startsWith('K_') || 
            userId.startsWith('G_') || 
            userId.startsWith('N_')
        );
        
        // 프로필 이미지 로드
        const storedProfileImage = localStorage.getItem('profileImage');
        const storedNickname = localStorage.getItem('userNickname');
        
        // 소셜 로그인이 아닌 경우, 일반 회원가입 시 설정한 프로필 이미지 사용
        if (!isSocialLogin) {
            // 회원가입 시 설정한 프로필 이미지 키
            const signupProfileImage = localStorage.getItem('signupProfileImage');
            if (signupProfileImage) {
                setProfileImage(signupProfileImage);
                console.log('일반 회원 프로필 이미지 로드:', signupProfileImage);
            } else if (storedProfileImage) {
                // 기존 프로필 이미지가 있지만 소셜 로그인이 아니면 제거
                localStorage.removeItem('profileImage');
                console.log('소셜 로그인 프로필 이미지 제거');
            }
        } else if (storedProfileImage) {
            // 소셜 로그인인 경우 소셜 프로필 이미지 사용
            setProfileImage(storedProfileImage);
            console.log('소셜 로그인 프로필 이미지 로드:', storedProfileImage);
        } else {
            console.log('저장된 프로필 이미지 없음');
        }
        
        if (storedNickname) {
            setNickname(storedNickname);
            console.log('닉네임 로드:', storedNickname);
        } else {
            console.log('저장된 닉네임 없음');
        }
    }, [userId]); // userId만 의존성으로 설정하여 불필요한 재실행 방지

    // 사용자 ID에서 소셜 로그인 제공자 추출
    const getSocialProvider = (userId: string | null): string => {
        if (!userId) return '알 수 없음';
        
        if (userId.startsWith('K_')) return '카카오';
        if (userId.startsWith('G_')) return '구글';
        if (userId.startsWith('N_')) return '네이버';
        
        return '일반 로그인';
    };
    
    // 화면에 표시할 최종 사용자 ID 결정 (더 이상 'hello' 기본값 사용 안함)
    const displayUserId = userId || '로그인 필요';

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{
                color: '#333',
                borderBottom: '2px solid #eee',
                paddingBottom: '10px'
            }}>사용자 프로필</h1>
            
            <div style={{
                marginBottom: '20px'
            }}>
                <Link to="/main" style={{
                    color: '#0066cc',
                    textDecoration: 'none'
                }}>메인으로 돌아가기</Link>
            </div>
            
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    {profileImage ? (
                        <img 
                            src={profileImage}
                            alt="프로필 이미지"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                marginRight: '20px',
                                objectFit: 'cover',
                                border: '3px solid #eee'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: '#eee',
                            marginRight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            color: '#999'
                        }}>
                            {nickname ? nickname[0].toUpperCase() : displayUserId ? displayUserId[0].toUpperCase() : '?'}
                        </div>
                    )}
                    <div>
                        <h2 style={{
                            margin: '0 0 10px 0',
                            color: '#333'
                        }}>사용자 정보</h2>
                        <p style={{
                            margin: '0 0 5px 0',
                            color: '#666'
                        }}><strong>닉네임:</strong> {nickname || '설정된 닉네임 없음'}</p>
                        <div style={{
                            margin: '10px 0',
                            padding: '8px 12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}>
                            <p style={{
                                margin: '0',
                                fontSize: '15px',
                                color: '#333',
                                fontWeight: 'bold'
                            }}>아이디</p>
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: '18px',
                                color: '#4B0082',
                                fontWeight: 'bold'
                            }}>{displayUserId}</p>
                        </div>
                        <p style={{
                            margin: '10px 0 5px 0',
                            color: '#666'
                        }}><strong>로그인 방식:</strong> {getSocialProvider(displayUserId)}</p>
                        <button style={{
                            width: '100px',
                            margin: '0',
                            textDecoration: 'none',
                            fontWeight: 600,
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: '#ffdddd',
                            color: '#4B0082',
                            border: 'none',
                            cursor: 'pointer'
                        }} onClick={handleLogout}>로그아웃</button>
                    </div>
                </div>
                
                {!profileImage && (
                    <p style={{
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        소셜 로그인 시 프로필 이미지가 자동으로 표시됩니다.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Profile; 