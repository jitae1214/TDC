"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkspace } from '../../../api/workspaceService';
import './styles.css';

const WorkspaceChat = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [loading, setLoading] = useState(true);

    // URL에서 워크스페이스 ID 추출
    useEffect(() => {
        // URL에서 ID 파라미터 가져오기
        if (params.id && !isNaN(Number(params.id))) {
            const extractedId = Number(params.id);
            setWorkspaceId(extractedId);
            
            // 워크스페이스 정보 로딩
            loadWorkspaceInfo(extractedId);
        } else {
            // URL에서 워크스페이스 ID를 찾을 수 없는 경우
            console.error('워크스페이스 ID를 URL에서 찾을 수 없습니다');
            
            // 메인 페이지로 리다이렉트
            navigate('/main');
        }
    }, [params.id, navigate]);

    // 워크스페이스 정보 로드
    const loadWorkspaceInfo = async (id: number) => {
        try {
            setLoading(true);
            const workspace = await getWorkspace(id);
            setWorkspaceName(workspace.name);
            setLoading(false);
        } catch (error) {
            console.error('워크스페이스 정보 로딩 중 오류:', error);
            // 오류 시 메인 페이지로 리다이렉트
            navigate('/main');
        }
    };

    return (
        <div className="workspace-chat-container">
            {/* UI 요소가 모두 삭제되었습니다 */}
        </div>
    );
};

export default WorkspaceChat;