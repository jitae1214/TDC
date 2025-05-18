"use client";

import React, {useState, useEffect} from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import searchIcon from '../../../../shared/image/search.png'
import dotIcon from '../../../../shared/image/dots.png'
import chatIcon from '../../../../shared/image/chat.png'
import { addWorkspaceMember, getWorkspace, getWorkspaceMembers } from '../../../../api/workspaceService';
import { getUsernameFromStorage, getCurrentUser } from '../../../../api/authService';
import "./styles.css";

// WorkspaceMember 인터페이스 추가
interface WorkspaceMember {
    id: number;
    username: string;
    email: string;
    role: string;
    joinedAt: string;
    nickname?: string; // 닉네임 필드 추가
    profileImageUrl?: string; // 프로필 이미지 URL 필드 추가
}

// uc774ubbf8uc9c0 URLuc774 uc808ub300 URLuc778uc9c0 ud655uc778ud558ub294 ud568uc218
const getImageUrl = (imageUrl: string | null): string | undefined => {
    if (!imageUrl) return undefined;
    
    console.log('WorkspaceMain에서 처리 전 이미지 URL:', imageUrl);
    
    // uc774ubbf8 uc644uc804ud55c URLuc778 uacbduc6b0(http://, https://ub85c uc2dcuc791)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('이미 완전한 URL:', imageUrl);
        return imageUrl;
    }
    
    // uc11cubc84uc758 uc0c1ub300 uacbdub85c(/uploads/ub85c uc2dcuc791)uc778 uacbduc6b0
    if (imageUrl.startsWith('/uploads/')) {
        // ubc31uc5d4ub4dc uc11cubc84 URL uc9c1uc811 uc9c0uc815
        const fullUrl = `http://localhost:8080${imageUrl}`;
        console.log('백엔드 서버 URL 추가:', fullUrl);
        return fullUrl;
    }
    
    // uadf8 uc678uc758 uacbduc6b0 (base64 ub370uc774ud130 ub4f1) uadf8ub300ub85c ubc18ud658
    console.log('기타 형식 이미지:', imageUrl.substring(0, 30) + '...');
    return imageUrl;
};

const WorkspaceMain = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const currentUser = getUsernameFromStorage(); // 현재 로그인한 사용자 정보
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteUserId, setInviteUserId] = useState('');
    const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
    const [inviteStatus, setInviteStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [workspaceId, setWorkspaceId] = useState<number | null>(null);
    const [workspaceName, setWorkspaceName] = useState('워크스페이스 이름');
    // 멤버 목록 상태 추가
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    
    // 초기 로딩 시 사용자 프로필 정보 가져오기
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUser) return;
            
            try {
                console.log('워크스페이스 화면에서 사용자 프로필 로드 시도');
                const response = await getCurrentUser();
                
                if (response && response.success === true) {
                    const userData = response.data || {};
                    
                    // DB에 저장된 프로필 이미지가 있으면 로컬 스토리지에 저장
                    if (userData.profileImageUrl) {
                        console.log('워크스페이스: DB에서 프로필 이미지 로드:', userData.profileImageUrl);
                        
                        // 로컬 스토리지에 저장 (동기화)
                        const userSpecificImageKey = `profileImage_${currentUser}`;
                        localStorage.setItem(userSpecificImageKey, userData.profileImageUrl);
                        localStorage.setItem('profileImage', userData.profileImageUrl);
                    }
                }
            } catch (error) {
                console.error('워크스페이스: 사용자 프로필 로드 실패:', error);
            }
        };
        
        fetchUserProfile();
    }, [currentUser]);

    // URL에서 워크스페이스 ID 추출
    useEffect(() => {
        // 로그인 확인
        if (!currentUser) {
            console.error('로그인 정보가 없습니다.');
            navigate('/login');
            return;
        }

        // URL에서 ID 파라미터 가져오기
        if (params.id && !isNaN(Number(params.id))) {
            const extractedId = Number(params.id);
            setWorkspaceId(extractedId);
            
            // 현재 워크스페이스 ID를 저장 (현재 사용자 정보와 함께)
            localStorage.setItem(`currentWorkspace_${currentUser}`, extractedId.toString());
            
            // 하위 호환성을 위해 일반 키로도 저장
            localStorage.setItem('currentWorkspaceId', extractedId.toString());
            localStorage.setItem('currentWorkspaceId_user', currentUser);
            
            // 워크스페이스 정보 로딩
            loadWorkspaceInfo(extractedId);
        } else {
            // URL에서 워크스페이스 ID를 찾을 수 없는 경우
            console.error('워크스페이스 ID를 URL에서 찾을 수 없습니다');
            
            // 메인 페이지로 리다이렉트
            navigate('/main');
        }
    }, [params.id, navigate, currentUser]);

    // 워크스페이스 정보 로드
    const loadWorkspaceInfo = async (id: number) => {
        try {
            setIsLoading(true);
            // 워크스페이스 정보 가져오기
            const workspace = await getWorkspace(id);
            setWorkspaceName(workspace.name);
            
            // 워크스페이스 멤버 목록 가져오기
            const membersData = await getWorkspaceMembers(id);
            console.log('워크스페이스 멤버 데이터:', membersData);
            
            // 각 멤버의 닉네임과 프로필 이미지 확인
            membersData.forEach(member => {
                console.log(`멤버 ${member.username} - 닉네임: ${member.nickname || '없음'}, 프로필 이미지: ${member.profileImageUrl || '없음'}`);
            });
            
            setMembers(membersData);
            
            setIsLoading(false);
        } catch (error) {
            console.error('워크스페이스 정보 로딩 중 오류:', error);
            // 오류 시 메인 페이지로 리다이렉트
            navigate('/main');
        }
    };

    // DM 버튼 클릭 핸들러
    const handleWorkspaceChat = () => {
        // 항상 ID를 포함하여 이동
        if (workspaceId) {
            navigate(`/workspace/${workspaceId}/chat`);
        } else {
            navigate('/main');
        }
    }

    // 현재 페이지가 DM 페이지인지 확인
    const isDMPage = location.pathname.includes('/chat');

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
            
            const newMember = await addWorkspaceMember(workspaceId, inviteUserId, inviteRole);
            
            // 멤버 목록에 추가
            setMembers(prevMembers => [...prevMembers, newMember]);
            
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

    // 사용자 역할에 따른 배지 표시
    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'OWNER':
                return <span className="workspaceMain-role-badge owner">소유자</span>;
            case 'ADMIN':
                return <span className="workspaceMain-role-badge admin">관리자</span>;
            default:
                return <span className="workspaceMain-role-badge member">멤버</span>;
        }
    };

    return (
        <div className="workspaceMain-container">
            <div className={"workspaceMain-sidebar"}>
                <div>
                    <div className={"workspaceMain-sidebar-button"}>
                        Home
                    </div>
                    <div className={isDMPage 
                        ? "workspaceMain-sidebar-button workspaceMain-sidebar-button-active" 
                        : "workspaceMain-sidebar-button"}
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
                    {/* 사용자 프로필 이미지 표시 */}
                    {currentUser && (
                        <>
                            {localStorage.getItem(`profileImage_${currentUser}`) ? (
                                <img 
                                    src={getImageUrl(localStorage.getItem(`profileImage_${currentUser}`))}
                                    alt="사용자 프로필" 
                                    className="workspaceMain-sidebar-profile-img"
                                    onError={(e) => {
                                        console.error('프로필 이미지 로드 오류:', e);
                                        // 이미지 로드 실패 시 플레이스홀더로 대체
                                        e.currentTarget.style.display = 'none';
                                        // 이미지 로드 실패 시 로컬 스토리지에서 제거하지 않음 - 일시적 네트워크 문제일 수 있음
                                    }}
                                />
                            ) : (
                                <div className="workspaceMain-sidebar-profile-placeholder">
                                    {currentUser.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className={"workspaceMain-sidebar-onlineCheck"}></div>
                        </>
                    )}
                    {!currentUser && (
                        <div className="workspaceMain-sidebar-profile-placeholder">?</div>
                    )}
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
                    <p>멤버 수 - {members.length}명</p>
                </div>
                
                {isLoading ? (
                    <div className="workspaceMain-loading">멤버 목록을 불러오는 중...</div>
                ) : (
                <div className={"workspaceMain-memberList"}>
                        {members.length > 0 ? (
                            members.map(member => (
                                <div className={"workspaceMain-memberBox"} key={member.id}>
                        <div>
                            <div className={"workspaceMain-memberProfile"}>
                                            {/* ud504ub85cud544 uc774ubbf8uc9c0 ud45cuc2dc */}
                                            {member.profileImageUrl ? (
                                                <img 
                                                    src={getImageUrl(member.profileImageUrl)} 
                                                    alt="ud504ub85cud544" 
                                                    className="workspaceMain-member-avatar"
                                                />
                                            ) : (
                                                <div className="workspaceMain-member-avatar-placeholder">
                                                    {(member.nickname || member.username || '').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                            </div>
                            <div className={"workspaceMain-memberInfo"}>
                                            <p>
                                                {/* 닉네임이 있으면 닉네임을, 없으면 사용자명을 표시 */}
                                                {member.nickname || member.username} {getRoleBadge(member.role)}
                                            </p>
                                            <p>{member.email}</p>
                            </div>
                        </div>
                        <div>
                            <div className={"workspaceMain-memberIcon"}>
                                            <span><img src={chatIcon} alt="채팅"/></span>
                            </div>
                            <div className={"workspaceMain-memberIcon"}>
                                            <span><img src={dotIcon} alt="옵션"/></span>
                            </div>
                        </div>
                    </div>
                            ))
                        ) : (
                            <div className="workspaceMain-no-members">
                                <p>아직 멤버가 없습니다. 멤버를 초대해보세요!</p>
                            </div>
                        )}
                    </div>
                )}
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
