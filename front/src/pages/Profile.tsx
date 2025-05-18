import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/authService';
import { uploadAndUpdateProfileImage } from '../api/fileService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile: React.FC = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    
    // 현재 로그인한 사용자 정보
    const currentUsername = localStorage.getItem('username') || '';
    const [userId, setUserId] = useState<string | null>(currentUsername);
    
    // 디버깅을 위해 즉시 콘솔로 상태 확인
    console.log('프로필 컴포넌트 렌더링, 현재 사용자:', currentUsername);
    console.log('현재 로컬 스토리지 내용:', {
        username: localStorage.getItem('username'),
        token: localStorage.getItem('token') ? '있음' : '없음',
        userSpecificKey: `profileImage_${currentUsername}`,
        userSpecificValue: localStorage.getItem(`profileImage_${currentUsername}`),
        profileImage: localStorage.getItem('profileImage')
    });
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await getCurrentUser();
                if (response && response.success === true) {
                    const userData = response.data || {};
                    setFullName(userData.fullName || 'Unknown');
                    setEmail(userData.email || 'No email provided');
                    setNickname(userData.nickname || '');
        
                    // DB에 저장된 프로필 이미지가 있으면 사용
                    if (userData.profileImageUrl) {
                        setProfileImage(userData.profileImageUrl);
                        console.log('DB에서 프로필 이미지 로드:', userData.profileImageUrl);
                        
                        // 로컬 스토리지에도 저장 (동기화)
                        const userSpecificImageKey = `profileImage_${currentUsername}`;
                        localStorage.setItem(userSpecificImageKey, userData.profileImageUrl);
                        localStorage.setItem('profileImage', userData.profileImageUrl);
                    } else {
                        // DB에 이미지가 없으면 로컬 스토리지에서 확인
                        loadProfileImageFromLocalStorage();
                    }
                } else {
                    console.error('사용자 프로필 로드 실패: 응답이 성공이 아닙니다.');
                    loadProfileImageFromLocalStorage();
                }
            } catch (error) {
                console.error('사용자 프로필 로드 실패:', error);
                
                // API 오류 시 로컬 스토리지에서 로드 시도
                loadProfileImageFromLocalStorage();
            }
        };

        fetchUserProfile();
    }, [currentUsername]);

    // 로컬 스토리지에서 프로필 이미지 로드
    const loadProfileImageFromLocalStorage = () => {
        // 사용자별 키로 먼저 확인
        const userSpecificImageKey = `profileImage_${currentUsername}`;
        const userSpecificImage = localStorage.getItem(userSpecificImageKey);
        
        if (userSpecificImage) {
            setProfileImage(userSpecificImage);
            console.log(`사용자 ${currentUsername}의 개인 프로필 이미지 로드:`, userSpecificImage);
        } 
        // 소셜 로그인 사용자라면 소셜 이미지 확인
        else if (currentUsername.startsWith('K_') || 
                 currentUsername.startsWith('G_') || 
                 currentUsername.startsWith('N_')) {
            const socialProfileImage = localStorage.getItem('profileImage');
            if (socialProfileImage) {
                setProfileImage(socialProfileImage);
                // 사용자별 키로 저장 (향후 사용을 위해)
                localStorage.setItem(userSpecificImageKey, socialProfileImage);
                console.log('소셜 프로필 이미지를 사용자별로 저장:', socialProfileImage);
            }
        }
        // 일반 키 확인 (하위 호환성)
        else {
            const generalProfileImage = localStorage.getItem('profileImage');
            if (generalProfileImage) {
                setProfileImage(generalProfileImage);
                // 사용자별 키로도 저장 (일관성을 위해)
                localStorage.setItem(userSpecificImageKey, generalProfileImage);
                console.log('일반 프로필 이미지를 사용자별로 저장:', generalProfileImage);
            }
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout();
            // 페이지 새로고침
            window.location.href = '/login';
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    // 이미지 URL이 절대 URL인지 확인하는 함수
    const getImageUrl = (imageUrl: string | null): string | undefined => {
        if (!imageUrl) return undefined;
        
        console.log('Profile에서 처리 전 이미지 URL:', imageUrl);
        
        // 이미 완전한 URL인 경우(http://, https://로 시작)
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            console.log('이미 완전한 URL:', imageUrl);
            return imageUrl;
        }
        
        // 서버의 상대 경로(/uploads/로 시작)인 경우
        if (imageUrl.startsWith('/uploads/')) {
            // 백엔드 서버 URL 직접 지정
            const fullUrl = `http://localhost:8080${imageUrl}`;
            console.log('백엔드 서버 URL 추가:', fullUrl);
            return fullUrl;
        }
        
        // 그 외의 경우 (base64 데이터 등) 그대로 반환
        console.log('기타 형식 이미지:', imageUrl.substring(0, 30) + '...');
        return imageUrl;
    };

    // 토스트 알림 표시 함수
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        toast[type](message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        
        try {
            setIsUploading(true);
            
            // 이미지 업로드 및 DB 업데이트
            const result = await uploadAndUpdateProfileImage(file);
            
            if (result && result.success) {
                const updatedImageUrl = result.data.profileImageUrl;
                setProfileImage(updatedImageUrl);
                showToast('프로필 이미지가 업로드되었습니다.', 'success');
                console.log('프로필 이미지 업로드 및 DB 업데이트 성공:', updatedImageUrl);
            } else {
                showToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
            }
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            showToast('이미지 업로드 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <ToastContainer />
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>사용자 프로필</h1>
            
            <div style={{
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
                marginBottom: '20px'
            }}>
                {/* 프로필 이미지 섹션 */}
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    {profileImage ? (
                        <img 
                            src={getImageUrl(profileImage)}
                            alt="프로필 이미지"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #3f51b5'
                            }}
                        />
                    ) : (
                        <div 
                            style={{
                                width: '120px',
                                height: '120px',
                            borderRadius: '50%',
                                backgroundColor: '#3f51b5',
                                display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                                fontSize: '50px',
                                color: '#fff',
                                fontWeight: 'bold'
                            }}
                        >
                            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    
                    {/* 이미지 업로드 버튼 */}
                    <div style={{ marginTop: '15px' }}>
                        <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                        <label 
                            htmlFor="profile-image-upload"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isUploading ? '#cccccc' : '#4CAF50',
                                color: 'white',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                borderRadius: '4px',
                                fontSize: '14px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isUploading ? '업로드 중...' : '프로필 이미지 변경'}
                        </label>
                    </div>
                </div>
                
                {/* 사용자 정보 섹션 */}
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>아이디</h3>
                        <p style={{ 
                            margin: 0, 
                            padding: '10px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}>{userId || '알 수 없음'}</p>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>이름</h3>
                        <p style={{ 
                            margin: 0, 
                            padding: '10px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '4px' 
                        }}>{fullName || '알 수 없음'}</p>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>이메일</h3>
                        <p style={{ 
                            margin: 0, 
                            padding: '10px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '4px' 
                        }}>{email || '알 수 없음'}</p>
                    </div>
                    
                    {nickname && (
                        <div style={{ marginBottom: '15px' }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>닉네임</h3>
                    <p style={{
                                margin: 0, 
                                padding: '10px', 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: '4px' 
                            }}>{nickname}</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* 버튼 섹션 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <Link 
                    to="/main" 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3f51b5',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        transition: 'background-color 0.3s'
                    }}
                >
                    메인으로
                </Link>
                
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
};

export default Profile; 