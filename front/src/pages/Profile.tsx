import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../api/authService';

const Profile: React.FC = () => {
    const username = getCurrentUser();
    
    return (
        <div>
            <h1>사용자 프로필</h1>
            
            <div>
                <Link to="/">메인으로 돌아가기</Link>
            </div>
            
            <div>
                <h2>사용자 정보</h2>
                <p><strong>아이디:</strong> {username}</p>
                
                {/* 추가 프로필 정보는 백엔드 API를 통해 가져올 수 있습니다 */}
                <p>추가 프로필 정보 준비 중</p>
            </div>
        </div>
    );
};

export default Profile; 