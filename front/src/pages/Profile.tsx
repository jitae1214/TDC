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
        }
    }, []);
    
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
                            margin: '0',
                            color: '#666'
                        }}><strong>아이디:</strong> {username}</p>
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