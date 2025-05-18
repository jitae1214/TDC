"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./styles.css";
import chatImage from "../../../../shared/image/chat.png";
import { getWorkspaceMembers, getWorkspace } from "../../../../api/workspaceService";
import { getCurrentUser } from "../../../../api/authService";

// 멤버 타입 수정 (서버에서 가져오는 데이터와 일치하도록)
type Member = {
    id: number;
    username: string;
    email: string;
    nickname?: string;
    profileImageUrl?: string;
    role: string;
    status: "online" | "offline"; // 온라인/오프라인 상태 추가
};

type Message = {
    id: number;
    sender: string;
    img: string;
    time: string;
    content: string;
};

type GroupedMessage = {
    id: number;
    sender: string;
    time: string;
    contents: string[];
};

// 온라인 상태를 관리하기 위한 인터페이스
interface OnlineStatus {
    [userId: number]: boolean;
}

const WorkspaceChat: React.FC = () => {
    const { id: workspaceIdParam } = useParams<{ id: string }>();
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : null;
    const [members, setMembers] = useState<Member[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});
    const messages: Message[] = [];
    const navigate = useNavigate();

    // 멤버 목록과 워크스페이스 정보 로드
    useEffect(() => {
        if (workspaceId) {
            loadWorkspaceData(workspaceId);
            loadCurrentUser();
            // 접속 상태 감지를 위한 주기적 확인 설정
            const intervalId = setInterval(checkOnlineStatus, 10000); // 10초마다 확인
            
            return () => {
                clearInterval(intervalId);
            };
        } else {
            navigate('/main');
        }
    }, [workspaceId]);

    // 현재 사용자 정보 로드
    const loadCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUser(user);
            console.log('현재 사용자:', user);
        } catch (error) {
            console.error('현재 사용자 정보 로딩 오류:', error);
        }
    };

    // 워크스페이스 데이터 로드
    const loadWorkspaceData = async (id: number) => {
        try {
            setIsLoading(true);
            
            // 워크스페이스 정보 가져오기
            const workspace = await getWorkspace(id);
            setWorkspaceName(workspace.name);
            console.log('워크스페이스 정보:', workspace);
            
            // 워크스페이스 멤버 목록 가져오기
            const membersData = await getWorkspaceMembers(id);
            console.log('워크스페이스 멤버 데이터:', membersData);
            
            // 각 멤버의 프로필 이미지 URL 확인
            membersData.forEach(member => {
                console.log(`멤버 ${member.username || member.email} 프로필 이미지:`, member.profileImageUrl);
            });
            
            // 멤버 상태 초기화 (모두 오프라인으로 설정)
            const initialMembers = membersData.map(member => ({
                ...member,
                status: "offline" as "online" | "offline"
            }));
            
            setMembers(initialMembers);
            
            // 온라인 상태 확인
            checkOnlineStatus();
            
            setIsLoading(false);
        } catch (error) {
            console.error('워크스페이스 정보 로딩 중 오류:', error);
            navigate('/main');
        }
    };

    // 온라인 상태 확인
    const checkOnlineStatus = async () => {
        try {
            // 실제 구현에서는 서버로 현재 온라인 사용자 목록을 요청
            // 여기서는 예시로 간단하게 구현
            // 현재 사용자는 항상 온라인 상태로 표시
            
            if (!currentUser) return;
            
            // 임시 구현: 현재 사용자는 온라인, 다른 사용자는 랜덤하게 온라인/오프라인 설정
            const updatedStatus: OnlineStatus = {};
            
            members.forEach(member => {
                // 현재 로그인한 사용자는 항상 온라인
                if (member.id === currentUser.id) {
                    updatedStatus[member.id] = true;
                } else {
                    // 기존 상태 유지하거나 랜덤하게 변경 (실제 구현에서는 서버에서 상태 가져옴)
                    updatedStatus[member.id] = onlineStatus[member.id] || Math.random() > 0.7;
                }
            });
            
            setOnlineStatus(updatedStatus);
            
            // 멤버 목록 업데이트
            setMembers(prevMembers => 
                prevMembers.map(member => ({
                    ...member,
                    status: updatedStatus[member.id] ? "online" : "offline"
                }))
            );
            
        } catch (error) {
            console.error('온라인 상태 확인 중 오류:', error);
        }
    };

    const groupConsecutiveMessages = (messages: Message[]): GroupedMessage[] => {
        const grouped: GroupedMessage[] = [];
        let currentGroup: GroupedMessage | null = null;

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const isSameSender = currentGroup && msg.sender === currentGroup.sender;
            const isSameTime = currentGroup && msg.time === currentGroup.time;

            if (isSameSender && isSameTime && currentGroup) {
                currentGroup.contents.push(msg.content);
            } else {
                currentGroup = {
                    id: msg.id,
                    sender: msg.sender,
                    time: msg.time,
                    contents: [msg.content],
                };
                grouped.push(currentGroup);
            }
        }

        return grouped;
    };

    const groupedMessages = groupConsecutiveMessages(messages);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [groupedMessages]);

    // 프로필 이미지 URL 가져오기
    const getProfileImageUrl = (member: Member) => {
        console.log('프로필 이미지 URL 처리:', member.username, member.profileImageUrl);
        
        if (member.profileImageUrl) {
            // 이미지 URL이 전체 URL인 경우 그대로 사용
            if (member.profileImageUrl.startsWith('http')) {
                return member.profileImageUrl;
            }
            
            // 상대 경로인 경우 API 기본 URL 추가
            // process.env의 값이 없을 수 있으므로 기본값 설정
            const baseApiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
            
            // URL 조합 시 중복된 슬래시 방지
            let profilePath = member.profileImageUrl;
            if (profilePath.startsWith('/') && baseApiUrl.endsWith('/')) {
                profilePath = profilePath.substring(1);
            } else if (!profilePath.startsWith('/') && !baseApiUrl.endsWith('/')) {
                profilePath = '/' + profilePath;
            }
            
            const fullUrl = baseApiUrl + profilePath;
            console.log('변환된 이미지 URL:', fullUrl);
            return fullUrl;
        }
        
        console.log('기본 이미지 사용');
        // profileImageUrl이 없는 경우 기본 이미지 사용
        return chatImage;
    };
    
    // 이미지 로딩 오류 처리
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = chatImage; // 기본 이미지로 대체
    };

    // 사용자 이니셜 가져오기
    const getUserInitial = (member: Member) => {
        // 닉네임이나 사용자명에서 첫 글자 가져오기
        const name = member.nickname || member.username || member.email || '';
        return name.charAt(0).toUpperCase();
    };

    // 채팅 메시지 전송자 이미지 처리
    const getSenderImageUrl = (group: GroupedMessage) => {
        // 전송자에 해당하는 멤버 찾기
        const senderMember = members.find(m => m.username === group.sender || m.nickname === group.sender);
        
        if (senderMember?.profileImageUrl) {
            return getProfileImageUrl(senderMember);
        }
        
        return chatImage;
    };

    if (isLoading) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="workspaceChat-container">
            {/* 사이드바 */}
            <div className="workspaceChat-sidebar">
                <div className="workspaceChat-sidebar-menu">홈</div>
                <div className="workspaceChat-sidebar-menu">채팅</div>
                <div className="workspaceChat-sidebar-menu">일정</div>
                <div className="workspaceChat-sidebar-menu">초대</div>
                <div className="workspaceChat-sidebar-menu">멤버</div>
                <div className="workspaceChat-sidebar-menu">설정</div>
                <div className="workspaceChat-sidebar-menu">도움말</div>
            </div>

            {/* 중앙 유저 목록 */}
            <div className="workspaceChat-memberList">
                {["online", "offline"].map((status) => (
                    <div className="workspaceChat-statusGroup" key={status}>
                        <div className="workspaceChat-statusHeader">
                            {status === "online" 
                                ? `온라인 - ${members.filter(m => m.status === "online").length}명` 
                                : `오프라인 - ${members.filter(m => m.status === "offline").length}명`}
                        </div>
                        {members
                            .filter((member) => member.status === status)
                            .map((member) => (
                                <div className="workspaceChat-member" key={member.id}>
                                    {member.profileImageUrl ? (
                                        <img 
                                            src={getProfileImageUrl(member)} 
                                            className="workspaceChat-avatar" 
                                            alt="profile"
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <div className="workspaceChat-avatar workspaceChat-avatar-initial">
                                            {getUserInitial(member)}
                                        </div>
                                    )}
                                    <span
                                        className={`workspaceChat-status-dot ${status === "online" ? "green" : "gray"}`}>
                                    </span>
                                    <span className="workspaceChat-name">
                                        {member.nickname || member.username}
                                    </span>
                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {/* 채팅 영역 */}
            <div className="workspaceChat-chat-container">
                <div className="workspaceChat-chat-header">{workspaceName}</div>
                <div className="workspaceChat-chat-body" ref={chatBodyRef}>
                    <div className="workspaceChat-chat-message">
                        {groupedMessages.map((group) => (
                            <div key={group.id} className="workspaceChat-message-block">
                                <div className={"workspaceChat-message-senderImage"}>
                                    <img 
                                        src={getSenderImageUrl(group)}
                                        alt="sender"
                                        onError={handleImageError}
                                    /> 
                                </div>
                                <div>
                                    <div className="workspaceChat-message-header">
                                        <div className="sender-time">
                                            <strong>{group.sender}</strong>
                                            <span className="time">{group.time}</span>
                                        </div>
                                    </div>
                                    <div className="workspaceChat-message-body">
                                        {group.contents.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="workspaceChat-inputBox">
                    <input type="text" placeholder="메시지 입력..."/>
                    <div className="workspaceChat-button">📎</div>
                    <div className="workspaceChat-button">😊</div>
                    <div className="workspaceChat-button">s</div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceChat;
