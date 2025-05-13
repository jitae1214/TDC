import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace, checkWorkspaceName } from '../../../api/workspaceService';
import { getCurrentUser } from '../../../api/authService';
import './styles.css';

const WorkspaceCreate = () => {
    const [step, setStep] = useState(1);
    const [workspaceName, setWorkspaceName] = useState('');
    const [nameError, setNameError] = useState('');
    const [description, setDescription] = useState('');
    const [iconColor, setIconColor] = useState('#5E2CA5'); // 기본 색상 설정
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const fileInputRef = useRef(null);
    
    const navigate = useNavigate();
    const username = getCurrentUser();
    
    // 유저 이름을 초기화하기 위해 컴포넌트가 마운트될 때 실행
    useEffect(() => {
        // 로그인한 사용자의 아이디를 기본값으로 설정
        const storedUsername = localStorage.getItem('username');
        setDisplayName(storedUsername || username || '');
    }, [username]);

    const handleNameChange = (e) => {
        setWorkspaceName(e.target.value);
        if (nameError) setNameError('');
    };

    const handleDisplayNameChange = (e) => {
        setDisplayName(e.target.value);
    };

    const handleNextStep = async () => {
        if (!workspaceName.trim()) {
            setNameError('워크스페이스 이름을 입력해주세요.');
            return;
        }
        
        try {
            // 워크스페이스 이름 중복 체크
            const isAvailable = await checkWorkspaceName(workspaceName);
            if (!isAvailable) {
                setNameError('이미 사용 중인 워크스페이스 이름입니다.');
                return;
            }
            
            // 다음 단계로 진행
            setStep(2);
        } catch (error) {
            console.error('워크스페이스 이름 확인 중 오류 발생:', error);
            setNameError('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 파일 크기 검사 (5MB 이하)
        if (file.size > 5 * 1024 * 1024) {
            alert('이미지 크기는 5MB 이하여야 합니다.');
            return;
        }
        
        // 파일 형식 검사
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            alert('JPG, PNG, GIF, WEBP 형식만 지원합니다.');
            return;
        }
        
        setProfileImage(file);
        
        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateWorkspace = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            // JSON 데이터로 워크스페이스 생성 
            // (FormData 대신 JSON 객체 사용)
            const workspaceData = {
                name: workspaceName,
                description: description || `${workspaceName} 워크스페이스`,
                iconColor: iconColor,
                displayName: displayName,
                // 프로필 이미지는 Base64로 저장하지 않고 
                // 향후 별도 API를 통해 업로드 처리 
                // 또는 profileImageUrl을 받아 설정
            };
            
            console.log('워크스페이스 생성 요청 데이터:', workspaceData);
            
            // 워크스페이스 생성 요청
            const newWorkspace = await createWorkspace(workspaceData);
            
            console.log('생성된 워크스페이스:', newWorkspace);
            
            // 프로필 이미지가 있으면 로컬스토리지에 저장
            // (실제로는 서버에 업로드 후 URL을 저장하는 방식 권장)
            if (imagePreview) {
                localStorage.setItem('userProfileImage', imagePreview);
                console.log('워크스페이스 생성: 프로필 이미지를 localStorage["userProfileImage"]에 저장');
            }
            
            // 생성된 워크스페이스로 이동
            navigate(`/workspace/${newWorkspace.id}/chat`);
        } catch (error) {
            console.error('워크스페이스 생성 중 오류 발생:', error);
            
            // 에러 상세 정보 표시
            if (error.response) {
                alert(`워크스페이스 생성 실패: ${error.response.status} - ${
                    error.response.data?.message || '서버 오류가 발생했습니다.'
                }`);
            } else {
                alert('워크스페이스 생성 중 오류가 발생했습니다.');
            }
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // 메인 페이지로 돌아가기
        navigate('/main');
    };

    const handleBackToStep1 = () => {
        setStep(1);
    };

    return (
        <div className="workspace-create-container">
            <div className="workspace-create-card">
                {step === 1 ? (
                    <>
                        <div className="workspace-create-header">
                            <h1>1/2단계</h1>
                            <h2>회사 또는 팀 이름이 어떻게 됩니까?</h2>
                            <p>TDC 워크스페이스의 이름이 됩니다. 팀이 인식할 수 있는 이름을 입력하세요.</p>
                        </div>
                        
                        <div className="workspace-create-form">
                            <input
                                type="text"
                                placeholder="예: TDC 마케팅 또는 TDC Develop"
                                value={workspaceName}
                                onChange={handleNameChange}
                                maxLength="50"
                                className={nameError ? 'error' : ''}
                            />
                            {workspaceName && <span className="input-counter">{50 - workspaceName.length}</span>}
                            {nameError && <div className="error-message">{nameError}</div>}
                        </div>
                        
                        <div className="workspace-create-actions">
                            <button 
                                className="cancel-button" 
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button 
                                className="next-button" 
                                onClick={handleNextStep}
                                disabled={!workspaceName.trim() || isSubmitting}
                            >
                                {isSubmitting ? '처리 중...' : '다음'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="workspace-create-header">
                            <h1>2/2단계</h1>
                            <h2>당신의 이름은 무엇인가요?</h2>
                            <p>이름과 프로필 사진을 추가하면 팀원이 사용자를 쉽게 알아보고 연결하는 데 도움이 됩니다.</p>
                        </div>
                        
                        <div className="workspace-create-form">
                            <div className="profile-section">
                                <div className="profile-image-upload">
                                    {imagePreview ? (
                                        <div className="profile-image-preview-container">
                                            <img 
                                                src={imagePreview} 
                                                alt="프로필 이미지" 
                                                className="profile-image-preview"
                                            />
                                            <button 
                                                className="remove-image-button"
                                                onClick={handleRemoveImage}
                                                type="button"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="default-profile-image">
                                            <div className="profile-initials">
                                                {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleProfileImageChange}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg, image/png, image/gif, image/webp"
                                    />
                                    
                                    <button 
                                        className="upload-image-button"
                                        onClick={handleUploadButtonClick}
                                        type="button"
                                    >
                                        사진 업로드
                                    </button>
                                </div>
                                
                                <div className="display-name-input">
                                    <label htmlFor="displayName">내 이름</label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={handleDisplayNameChange}
                                        placeholder="실명을 입력하세요"
                                        maxLength="30"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="workspace-create-actions">
                            <button 
                                className="back-button" 
                                onClick={handleBackToStep1}
                            >
                                뒤로
                            </button>
                            <button 
                                className="create-button" 
                                onClick={handleCreateWorkspace}
                                disabled={!displayName.trim() || isSubmitting}
                            >
                                {isSubmitting ? '생성 중...' : '다음'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WorkspaceCreate; 