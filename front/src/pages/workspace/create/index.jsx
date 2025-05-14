import React, { useState } from 'react';
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
    const navigate = useNavigate();
    const username = getCurrentUser();

    const handleNameChange = (e) => {
        setWorkspaceName(e.target.value);
        if (nameError) setNameError('');
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
            
            // 다음 단계로 진행 (현재는 바로 생성으로 처리)
            handleCreateWorkspace();
        } catch (error) {
            console.error('워크스페이스 이름 확인 중 오류 발생:', error);
            setNameError('서버 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleCreateWorkspace = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            const workspaceData = {
                name: workspaceName,
                description: description || `${workspaceName} 워크스페이스`,
                iconColor: iconColor
            };
            
            const newWorkspace = await createWorkspace(workspaceData);
            
            // 생성된 워크스페이스로 이동
            navigate(`/workspace/${newWorkspace.id}/chat`);
        } catch (error) {
            console.error('워크스페이스 생성 중 오류 발생:', error);
            setNameError('워크스페이스 생성 중 오류가 발생했습니다.');
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // 메인 페이지로 돌아가기
        navigate('/main');
    };

    const handleWorkspaceMain = () => {
        navigate('/workspace/main');
    }

    return (
        <div className="workspace-create-container">
            <div className="workspace-create-card">
                <div className="workspace-create-header">
                    <h1>1/4단계</h1>
                    <h2>회사 또는 팀 이름이 어떻게 됩니까?</h2>
                    <p>Slack 워크스페이스의 이름이 됩니다. 팀이 인식할 수 있는 이름을 입력하세요.</p>
                </div>
                
                <div className="workspace-create-form">
                    <input
                        type="text"
                        placeholder="예: Acme 마케팅 또는 Acme"
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
                        onClick={handleWorkspaceMain}
                        disabled={!workspaceName.trim() || isSubmitting}
                    >
                        {isSubmitting ? '처리 중...' : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceCreate; 