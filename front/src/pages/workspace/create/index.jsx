import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace, checkWorkspaceName } from '../../../api/workspaceService';
import { getCurrentUser, getUsernameFromStorage } from '../../../api/authService';
import { uploadWorkspaceImage, updateUserProfileImage } from '../../../api/fileService';
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
    const username = getUsernameFromStorage();
    
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

    const handleProfileImageUpload = async (uploadedImageUrl) => {
        setProfileImage(uploadedImageUrl);
        
        // 현재 로그인한 사용자의 ID 가져오기
        const currentUser = getUsernameFromStorage();
        
        if (!currentUser) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
        }
        
        // 사용자별 고유 키 사용 (다른 사용자와 혼동 방지)
        const userSpecificImageKey = `profileImage_${currentUser}`;
        
        // 사용자별 프로필 이미지 저장
        localStorage.setItem(userSpecificImageKey, uploadedImageUrl);
        console.log(`사용자 ${currentUser}의 프로필 이미지가 저장되었습니다:`, uploadedImageUrl);
        
        // 하위 호환성을 위한 일반 키도 유지 (단, 현재 로그인한 사용자의 것임을 기록)
        localStorage.setItem('userProfileImage', uploadedImageUrl);
        localStorage.setItem('userProfileImage_owner', currentUser);
        
        // 프로필 이미지 URL을 데이터베이스에도 업데이트 (기존 API 함수 사용)
        try {
            const result = await updateUserProfileImage(uploadedImageUrl);
            if (result && result.success) {
                console.log('프로필 이미지 URL이 데이터베이스에 저장되었습니다.');
            } else {
                console.error('프로필 이미지 URL 데이터베이스 업데이트 실패:', result.message || '알 수 없는 오류');
            }
        } catch (error) {
            console.error('프로필 이미지 URL 데이터베이스 업데이트 중 오류:', error);
        }
    };

    // 사용자별 닉네임 저장 함수 개선
    const saveUserNickname = (nickname) => {
        if (!nickname) return;
        
        // 현재 로그인한 사용자의 ID 가져오기
        const currentUser = getUsernameFromStorage();
        
        if (!currentUser) {
            console.error('사용자 ID를 찾을 수 없습니다.');
            return;
        }
        
        // 사용자별 고유 키 사용 (다른 사용자와 혼동 방지)
        const userSpecificNicknameKey = `nickname_${currentUser}`;
        
        // 사용자별 닉네임 저장
        localStorage.setItem(userSpecificNicknameKey, nickname);
        console.log(`사용자 ${currentUser}의 닉네임이 저장되었습니다:`, nickname);
        
        // 하위 호환성을 위한 일반 키도 유지 (단, 현재 로그인한 사용자의 것임을 기록)
        localStorage.setItem('userNickname', nickname);
        localStorage.setItem('userNickname_owner', currentUser);
    };

    const handleCreateWorkspace = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            // 이미지 파일이 있으면 먼저 업로드
            let imageUrl = null;
            if (profileImage) {
                try {
                    imageUrl = await uploadWorkspaceImage(profileImage);
                    console.log('워크스페이스 이미지 업로드 성공:', imageUrl);
                    
                    // 워크스페이스 이미지를 프로필 이미지로도 업데이트
                    if (imageUrl) {
                        try {
                            const profileResult = await updateUserProfileImage(imageUrl);
                            if (profileResult && profileResult.success) {
                                console.log('워크스페이스 이미지가 프로필 이미지로도 저장되었습니다.');
                            }
                        } catch (profileError) {
                            console.error('프로필 이미지 업데이트 중 오류:', profileError);
                        }
                    }
                } catch (error) {
                    console.error('워크스페이스 이미지 업로드 실패:', error);
                }
            }
            
            // 워크스페이스 데이터 구성
            const workspaceData = {
                name: workspaceName,
                description: description || `${workspaceName} 워크스페이스`,
                iconColor: iconColor,
                displayName: displayName,
                imageUrl: imageUrl // 업로드된 이미지 URL 추가
            };
            
            console.log('워크스페이스 생성 요청 데이터:', workspaceData);
            
            // 워크스페이스 생성 요청
            const newWorkspace = await createWorkspace(workspaceData);
            
            console.log('생성된 워크스페이스:', newWorkspace);
            
            // 입력된 닉네임이 있으면 사용자별로 저장
            if (displayName.trim()) {
                saveUserNickname(displayName.trim());
            }
            
            // 프로필 이미지가 있으면 URL 정보를 사용자별로 저장
            if (imageUrl) {
                const currentUser = getUsernameFromStorage();
                if (currentUser) {
                    const userSpecificImageKey = `profileImage_${currentUser}`;
                    localStorage.setItem(userSpecificImageKey, imageUrl);
                    localStorage.setItem('userProfileImage', imageUrl);
                    localStorage.setItem('userProfileImage_owner', currentUser);
                }
            }
            
            // 생성된 워크스페이스 ID 저장 (사용자별로 저장)
            if (newWorkspace && newWorkspace.id) {
                const currentUser = getUsernameFromStorage();
                if (currentUser) {
                    // 사용자별 워크스페이스 ID 저장
                    localStorage.setItem(`workspace_${currentUser}`, newWorkspace.id.toString());
                    // 현재 워크스페이스 ID도 저장 (하위 호환성)
                    localStorage.setItem('currentWorkspaceId', newWorkspace.id.toString());
                    localStorage.setItem('currentWorkspaceId_owner', currentUser);
                }
                
                // 생성된 워크스페이스로 이동 (ID 포함)
                navigate(`/workspace/${newWorkspace.id}/main`);
            } else {
                navigate('/main');
            }
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
        } finally {
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