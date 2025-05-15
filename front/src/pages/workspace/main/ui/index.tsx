import React, {useState, useEffect} from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import searchIcon from '../../../../shared/image/search.png'
import dotIcon from '../../../../shared/image/dots.png'
import chatIcon from '../../../../shared/image/chat.png'
import testImage from '../../../../shared/image/testImage.png'
import { addWorkspaceMember, getWorkspace } from '../../../../api/workspaceService';
import "./styles.css";


const WorkspaceMain = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteUserId, setInviteUserId] = useState('');
    const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
    const [inviteStatus, setInviteStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);
    const [workspaceName, setWorkspaceName] = useState('워크스페이스 이름');

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
            const workspace = await getWorkspace(id);
            setWorkspaceName(workspace.name);
        } catch (error) {
            console.error('워크스페이스 정보 로딩 중 오류:', error);
            // 오류 시 메인 페이지로 리다이렉트
            navigate('/main');
        }
    };

    const handleWorkspaceChat = () => {
        // 항상 ID를 포함하여 이동
        if (workspaceId) {
            navigate(`/workspace/${workspaceId}/chat`);
        } else {
            navigate('/main');
        }
    }

    const handleOpenInviteModal = () => {
        setShowInviteModal(true);
        setInviteUserId('');
        setInviteRole('MEMBER');
        setInviteStatus(null);
    }

    const handleCloseInviteModal = () => {
        setShowInviteModal(false);
    }

    const handleInviteUser = async () => {
        if (!inviteUserId.trim()) {
            setInviteStatus({
                message: '사용자 아이디 또는 이메일을 입력해주세요.',
                type: 'error'
            });
            return;
        }

        if (!workspaceId) {
            setInviteStatus({
                message: '워크스페이스 ID를 찾을 수 없습니다.',
                type: 'error'
            });
            return;
        }

        try {
            setIsLoading(true);
            setInviteStatus(null);
            
            await addWorkspaceMember(workspaceId, inviteUserId, inviteRole);
            
            setInviteStatus({
                message: '사용자가 성공적으로 초대되었습니다.',
                type: 'success'
            });
            
            // 성공 후 입력 필드 초기화
            setInviteUserId('');
        } catch (error: any) {
            console.error('사용자 초대 중 오류 발생:', error);
            
            let errorMessage = '사용자 초대 중 오류가 발생했습니다.';
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = '존재하지 않는 사용자이거나 잘못된 요청입니다.';
                } else if (error.response.status === 403) {
                    errorMessage = '초대 권한이 없습니다.';
                } else if (error.response.status === 409) {
                    errorMessage = '이미 워크스페이스의 멤버입니다.';
                }
            }
            
            setInviteStatus({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="workspaceMain-container">
            <div className={"workspaceMain-sidebar"}>
                <div>
                    <div className={"workspaceMain-sidebar-button"}>
                        Home
                    </div>
                    <div className={"workspaceMain-sidebar-button"}
                         onClick={handleWorkspaceChat}>
                        DM
                    </div>
                    <div className={"workspaceMain-sidebar-button"}>
                        일정관리
                    </div>
                    <div className={"workspaceMain-sidebar-button"}
                         onClick={handleOpenInviteModal}>
                        초대하기
                    </div>
                    {/*<div className={"workspaceMain-sidebar-button"}>*/}
                    {/*    X*/}
                    {/*</div>*/}
                    <div className={"workspaceMain-sidebar-button"}>
                        설정
                    </div>
                </div>

                <div className={"workspaceMain-sidebar-button workspaceMain-sidebar-profile"}>
                    <img src={testImage} alt=""/>
                    <div className={"workspaceMain-sidebar-onlineCheck"}></div>
                </div>
            </div>
            <div className={"workspaceMain-body"}>
                <div className={"workspaceMain-titleBox"}>
                    <h2>{workspaceName}</h2>
                    {workspaceId && <small className="workspaceMain-id">ID: {workspaceId}</small>}
                </div>
                <div className={"workspaceMain-searchBox"}>
                    <input placeholder={"검색하기"}/>
                    <span><img src={searchIcon} alt={""} className={"workspaceMain-searchIcon"}/></span>
                </div>
                <div className={"workspaceMain-memberNum"}>
                    <p>맴버 수 - 10명</p>
                </div>
                <div className={"workspaceMain-memberList"}>
                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>

                    <div className={"workspaceMain-memberBox"}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                {/*<img />*/}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                <p>사용자 이름</p>
                                <p>온라인</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={chatIcon} alt=""/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                <span><img src={dotIcon} alt=""/></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 초대 모달 */}
            {showInviteModal && (
                <div className="workspaceMain-modal-overlay">
                    <div className="workspaceMain-invite-modal">
                        <div className="workspaceMain-invite-modal-header">
                            <h2>워크스페이스에 사용자 초대</h2>
                            <button 
                                className="workspaceMain-invite-modal-close"
                                onClick={handleCloseInviteModal}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="workspaceMain-invite-modal-content">
                            <p>
                                <strong>{workspaceName}</strong> 워크스페이스에 초대할 사용자의 아이디 또는 이메일을 입력하세요.
                            </p>
                            
                            <div className="workspaceMain-invite-form">
                                <div className="workspaceMain-invite-input-group">
                                    <label htmlFor="userId">사용자 아이디 또는 이메일</label>
                                    <input
                                        id="userId"
                                        type="text"
                                        value={inviteUserId}
                                        onChange={(e) => setInviteUserId(e.target.value)}
                                        placeholder="예: user123 또는 user@example.com"
                                    />
                                </div>
                                
                                <div className="workspaceMain-invite-input-group">
                                    <label htmlFor="role">권한</label>
                                    <select
                                        id="role"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'ADMIN')}
                                    >
                                        <option value="MEMBER">일반 멤버</option>
                                        <option value="ADMIN">관리자</option>
                                    </select>
                                </div>
                                
                                {inviteStatus && (
                                    <div className={`workspaceMain-invite-status ${inviteStatus.type}`}>
                                        {inviteStatus.message}
                                    </div>
                                )}
                                
                                <div className="workspaceMain-invite-actions">
                                    <button
                                        className="workspaceMain-invite-cancel"
                                        onClick={handleCloseInviteModal}
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="workspaceMain-invite-submit"
                                        onClick={handleInviteUser}
                                        disabled={isLoading || !workspaceId}
                                    >
                                        {isLoading ? '처리 중...' : '초대하기'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceMain;
