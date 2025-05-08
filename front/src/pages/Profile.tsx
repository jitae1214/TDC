import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../api/authService';

const Profile: React.FC = () => {
    const username = getCurrentUser();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    
    useEffect(() => {
        // 로컬 스토리지에서 프로필 이미지 URL 가져오기
        const storedProfileImage = localStorage.getItem('profileImage');
        if (storedProfileImage) {
            setProfileImage(storedProfileImage);
            console.log('프로필 이미지 로드:', storedProfileImage);
        } else {
            console.log('저장된 프로필 이미지 없음');
        }
    }, []);

    // 사용자 ID에서 소셜 로그인 제공자 추출
    const getSocialProvider = (userId: string | null): string => {
        if (!userId) return '알 수 없음';
        
        if (userId.startsWith('K_')) return '카카오';
        if (userId.startsWith('G_')) return '구글';
        if (userId.startsWith('N_')) return '네이버';
        
        return '일반 로그인';
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
                            {username ? username[0].toUpperCase() : '?'}
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
                        }}><strong>아이디:</strong> {username}</p>
                        <p style={{
                            margin: '0 0 5px 0',
                            color: '#666'
                        }}><strong>로그인 방식:</strong> {getSocialProvider(username)}</p>
                    </div>
                </div>
                
                {profileImage && (
                    <div style={{
                        backgroundColor: '#f9f9f9',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '20px',
                        fontSize: '12px'
                    }}>
                        <p style={{ margin: '0 0 5px 0' }}>
                            <strong>프로필 이미지 출처:</strong> {profileImage.includes('kakao') ? '카카오' : 
                                                             profileImage.includes('google') ? '구글' : 
                                                             profileImage.includes('naver') ? '네이버' : '기타'}
                        </p>
                        <p style={{ margin: '0', wordBreak: 'break-all' }}>
                            <strong>이미지 URL:</strong> {profileImage}
                        </p>
                    </div>
                )}
                
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