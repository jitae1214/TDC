"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./styles.css";
import chatImage from "../../../../shared/image/chat.png";
import { getWorkspaceMembers, getWorkspace, getWorkspaceOnlineMembers, getUserOnlineStatus } from "../../../../api/workspaceService";
import { getCurrentUser, getUsernameFromStorage, getAuthToken } from "../../../../api/authService";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 멤버 타입 수정 (서버에서 가져오는 데이터와 일치하도록)
type Member = {
    id: number | string;  // ID는 숫자 또는 문자열일 수 있음
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

// STOMP 메시지 타입 정의
type ChatMessage = {
    id?: string;
    chatRoomId: number;
    senderId: number;
    senderName: string;
    content: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE' | 'TYPING';
    timestamp?: Date;
    senderProfileUrl?: string;
};

// 온라인 상태를 관리하기 위한 인터페이스
interface OnlineStatus {
    [key: string | number]: boolean;
}

// STOMP 클라이언트 연결 및 구독 관리를 위한 전역 변수
const subscriptionMap = new Map<string, any>(); // 구독 ID 관리
const processedMessages = new Set<string>(); // 처리된 메시지 ID 관리

const WorkspaceChat: React.FC = () => {
    const { id: workspaceIdParam } = useParams<{ id: string }>();
    const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : null;
    const [members, setMembers] = useState<Member[]>([]);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});
    const [onlineMemberIds, setOnlineMemberIds] = useState<number[]>([]);
    const [forceUpdate, setForceUpdate] = useState<number>(0); // 강제 업데이트 트리거용 상태
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    const navigate = useNavigate();

    // STOMP 클라이언트 연결 설정 - 의존성 배열에서 workspaceId만 유지
    useEffect(() => {
        console.log('워크스페이스 ID 변경됨:', workspaceId);
        if (workspaceId) {
            // 먼저 사용자 정보 로드
            loadCurrentUser().then(() => {
                // 기존 연결 해제 후 새 연결 수립
                disconnectFromChat();
                connectToChat();
            });
        }
        
        return () => {
            disconnectFromChat();
            // 컴포넌트 언마운트 시 모든 전역 상태 초기화
            subscriptionMap.clear();
            processedMessages.clear();
        };
    }, [workspaceId]);

    // STOMP 클라이언트 연결 함수 - 연결 관리 강화
    const connectToChat = () => {
        // 이미 연결되어 있는 경우 연결 해제 먼저 수행
        disconnectFromChat();
        
        const token = getAuthToken();
        if (!token || !workspaceId) return;

        console.log('새 STOMP 클라이언트 생성 시작');
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                // 디버그 메시지 최소화
                if (str.includes('CONNECTED') || str.includes('ERROR')) {
                    console.log('STOMP 디버그:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            console.log('STOMP 연결 성공 - 새 세션:', stompClient.connected);
            
            // 워크스페이스 전체 채팅방 구독 (워크스페이스 ID를 채팅방 ID로 사용)
            const workspaceChatRoomId = workspaceId;
            setChatRoomId(workspaceChatRoomId);

            // 구독 식별자
            const subscriptionId = `/topic/chat/${workspaceChatRoomId}`;
            
            // 기존 구독이 있으면 제거
            if (subscriptionMap.has(subscriptionId)) {
                try {
                    const oldSubscription = subscriptionMap.get(subscriptionId);
                    oldSubscription.unsubscribe();
                    console.log('기존 구독 해제:', subscriptionId);
                } catch (error) {
                    console.log('기존 구독 해제 실패:', error);
                }
                subscriptionMap.delete(subscriptionId);
            }
            
            // 새 구독 생성
            console.log('새 구독 생성:', subscriptionId);
            const subscription = stompClient.subscribe(subscriptionId, (message) => {
                try {
                    const receivedMessage = JSON.parse(message.body);
                    console.log('메시지 수신:', receivedMessage.type, receivedMessage.senderName, receivedMessage.content);
                    
                    // 메시지 중복 체크를 위한 고유 ID 생성
                    const messageId = receivedMessage.id || 
                        `${receivedMessage.senderName}-${receivedMessage.content}-${receivedMessage.timestamp || Date.now()}`;
                    
                    // 이미 처리한 메시지는 건너뛰기
                    if (processedMessages.has(messageId)) {
                        console.log('중복 메시지 무시:', messageId);
                        return;
                    }
                    
                    // 메시지 ID 기록 (처리 표시)
                    processedMessages.add(messageId);
                    
                    // 처리할 메시지가 너무 많아지면 오래된 ID 제거
                    if (processedMessages.size > 200) {
                        const oldestId = Array.from(processedMessages)[0];
                        processedMessages.delete(oldestId);
                    }
                    
                    // 받은 메시지를 화면에 표시하기 위한 형식으로 변환
                    const newMessage: Message = {
                        id: parseInt(receivedMessage.id) || Date.now(),
                        sender: receivedMessage.senderName,
                        img: receivedMessage.senderProfileUrl || chatImage,
                        time: new Date(receivedMessage.timestamp || Date.now()).toLocaleTimeString(),
                        content: receivedMessage.content
                    };
                    
                    // 메시지 타입이 JOIN인 경우, 현재 사용자가 보낸 메시지인지 확인
                    // 현재 사용자가 보낸 입장 메시지는 표시하지 않음
                    const currentUsername = getUsernameFromStorage();
                    if (receivedMessage.type === 'JOIN' && 
                        receivedMessage.senderName === currentUsername) {
                        console.log('내가 보낸 입장 메시지는 표시하지 않습니다');
                        return;
                    }
                    
                    // 메시지 목록에 추가
                    setMessages(prev => [...prev, newMessage]);
                } catch (error) {
                    console.error('메시지 처리 중 오류:', error);
                }
            });
            
            // 구독 정보 저장
            subscriptionMap.set(subscriptionId, subscription);
            console.log('구독 등록 완료, ID:', subscription.id);

            // 채팅방 입장 메시지는 연결 후 한 번만 전송
            if (currentUser) {
                setTimeout(() => {
                    console.log('입장 메시지 전송 준비...');
                    const joinMessage: ChatMessage = {
                        chatRoomId: workspaceChatRoomId,
                        senderId: currentUser.id || 0,
                        senderName: currentUser.username || getUsernameFromStorage() || '알 수 없는 사용자',
                        content: '채팅방에 입장했습니다.',
                        type: 'JOIN',
                        senderProfileUrl: currentUser.profileImageUrl,
                        timestamp: new Date()
                    };
                    
                    // 고유 식별자 생성
                    const joinMessageId = `${joinMessage.senderName}-${joinMessage.content}-${Date.now()}`;
                    if (!processedMessages.has(joinMessageId)) {
                        // 서버로 전송
                        stompClient.publish({
                            destination: '/app/chat.addUser',
                            body: JSON.stringify(joinMessage)
                        });
                        console.log('입장 메시지 전송 완료!');
                        
                        // 전송한 메시지 ID 추적에 추가
                        processedMessages.add(joinMessageId);
                    } else {
                        console.log('이미 전송된 입장 메시지, 건너뜀');
                    }
                }, 500); // 0.5초 지연
            }
        };

        stompClient.onStompError = (frame) => {
            console.error('STOMP 오류:', frame);
        };

        // 연결 활성화
        stompClient.activate();
        stompClientRef.current = stompClient;
        console.log('STOMP 연결 활성화 요청 완료');
    };

    // STOMP 연결 해제 - 더 안전하게 처리
    const disconnectFromChat = () => {
        console.log('STOMP 연결 해제 시작');
        
        if (stompClientRef.current) {
            try {
                // 구독 목록에서 모든 구독 해제
                subscriptionMap.forEach((subscription, id) => {
                    try {
                        subscription.unsubscribe();
                        console.log(`구독 해제: ${id}`);
                    } catch (error) {
                        console.log(`구독 해제 실패: ${id}`, error);
                    }
                });
                subscriptionMap.clear();
                
                // 연결 상태인 경우에만 추가 정리
                if (stompClientRef.current.connected) {
                    // 퇴장 메시지는 연결이 있을 때만 전송
                    if (currentUser && chatRoomId) {
                        const leaveMessage: ChatMessage = {
                            chatRoomId: chatRoomId,
                            senderId: currentUser.id || 0,
                            senderName: currentUser.username || getUsernameFromStorage() || '알 수 없는 사용자',
                            content: '채팅방에서 퇴장했습니다.',
                            type: 'LEAVE',
                            timestamp: new Date()
                        };
                        
                        stompClientRef.current.publish({
                            destination: '/app/chat.sendMessage',
                            body: JSON.stringify(leaveMessage)
                        });
                        console.log('퇴장 메시지 전송 완료');
                    }
                    
                    // 연결 해제
                    stompClientRef.current.deactivate();
                    console.log('STOMP 연결 해제 완료');
                }
            } catch (error) {
                console.error('STOMP 연결 해제 중 오류:', error);
            } finally {
                stompClientRef.current = null;
                console.log('STOMP 클라이언트 참조 제거');
            }
        }
    };

    // 메시지 전송 함수 - 고유 ID 포함 및 즉시 필터링
    const sendMessage = () => {
        if (!inputMessage.trim() || !stompClientRef.current || !stompClientRef.current.connected || !chatRoomId || !currentUser) return;
        
        const now = new Date();
        const chatMessage: ChatMessage = {
            chatRoomId: chatRoomId,
            senderId: currentUser.id || 0,
            senderName: currentUser.username || getUsernameFromStorage() || '알 수 없는 사용자',
            content: inputMessage,
            type: 'CHAT',
            senderProfileUrl: currentUser.profileImageUrl,
            timestamp: now
        };
        
        // 고유 식별자 생성
        const messageId = `${chatMessage.senderName}-${chatMessage.content}-${now.getTime()}`;
        
        // 이미 보낸 메시지인지 확인
        if (processedMessages.has(messageId)) {
            console.log('이미 전송된 메시지입니다.');
            return;
        }
        
        // 메시지 전송
        console.log('메시지 전송:', chatMessage);
        stompClientRef.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(chatMessage)
        });
        
        // 전송한 메시지 ID 추적에 추가
        processedMessages.add(messageId);
        
        // 입력 내용 초기화
        setInputMessage('');
    };

    // 멤버 목록과 워크스페이스 정보 로드
    useEffect(() => {
        if (workspaceId) {
            loadWorkspaceData(workspaceId);
            loadCurrentUser();
            // 접속 상태 감지를 위한 주기적 확인 설정
            const intervalId = setInterval(() => {
                fetchOnlineStatus();
                // 주기적으로 강제 업데이트를 트리거하여 UI가 갱신되도록 함
                setForceUpdate(prev => prev + 1);
            }, 10000); // 10초마다 확인
            
            return () => {
                clearInterval(intervalId);
            };
        } else {
            navigate('/main');
        }
    }, [workspaceId]);
    
    // 현재 사용자 정보 변경 시 온라인 상태 업데이트
    useEffect(() => {
        if (currentUser && members.length > 0) {
            console.log('현재 사용자 정보 변경으로 온라인 상태 업데이트');
            fetchOnlineStatus();
        }
    }, [currentUser, members.length]);

    // 현재 사용자 정보 로드
    const loadCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            console.log('현재 사용자 로드:', user);
            
            // 로컬 스토리지에서 사용자 이름 가져오기
            const usernameFromStorage = getUsernameFromStorage();
            console.log('localStorage에서 가져온 사용자 이름:', usernameFromStorage);
            
            if (user) {
                setCurrentUser({
                    ...user,
                    usernameFromStorage  // 로컬 스토리지에서 가져온 이름도 저장
                });
            }
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
            await fetchOnlineStatus();
            
            setIsLoading(false);
        } catch (error) {
            console.error('워크스페이스 정보 로딩 중 오류:', error);
            navigate('/main');
        }
    };

    // 온라인 상태 확인 - 서버에서 실제 상태 가져오기
    const fetchOnlineStatus = async () => {
        try {
            if (!workspaceId) return;
            
            // 현재 로그인한 사용자 이름
            const currentUsername = getUsernameFromStorage();
            console.log('현재 로그인한 사용자:', currentUsername);
            
            // 각 멤버의 ID, 이름 등 로그로 출력
            console.log('멤버 목록 상세 정보:');
            members.forEach(member => {
                console.log(`멤버 ID: ${member.id} (타입: ${typeof member.id}), 이름: ${member.username}, 이메일: ${member.email}, 역할: ${member.role}`);
            });
            
            // 서버에서 온라인 멤버 ID 목록 가져오기
            const onlineMembers = await getWorkspaceOnlineMembers(workspaceId);
            console.log('서버에서 가져온 온라인 멤버 ID 목록:', onlineMembers);
            setOnlineMemberIds(onlineMembers);
            
            // 온라인 상태 업데이트
            const updatedStatus: OnlineStatus = {};
            
            // 각 멤버의 온라인 상태 설정
            for (const member of members) {
                // 현재 로그인한 사용자인지 확인 (본인인 경우 항상 온라인으로 표시)
                const isCurrentUser = currentUsername && (member.username === currentUsername);
                
                // 멤버 ID 처리 - ID가 없으면 username 사용
                const effectiveId = member.id || member.username;
                
                // username 기반으로 소셜 로그인 사용자 감지 (kakao_, google_ 등으로 시작하는 이메일)
                const isSocialLoginUser = 
                    member.username && (
                        member.username.includes('kakao_') || 
                        member.username.includes('google_') || 
                        member.username.includes('naver_')
                    );
                
                // 로그에 상세 정보 출력
                console.log(`멤버 ${member.username} 처리 - 유효 ID: ${effectiveId}, 소셜 로그인 여부: ${isSocialLoginUser}`);
                
                if (!effectiveId) {
                    console.error(`멤버 ${member.username || member.email}의 ID가 없고 username도 없습니다.`);
                    continue;
                }
                
                // 소셜 로그인 사용자인 경우 특별 처리
                if (isSocialLoginUser) {
                    console.log(`소셜 로그인 사용자 처리: ${member.username}, 사용 ID: ${effectiveId}`);
                    // 소셜 로그인 사용자는 현재 로그인한 사용자인 경우에만 온라인으로 표시
                    updatedStatus[String(effectiveId)] = Boolean(isCurrentUser);
                    continue;
                }
                
                // 일반 사용자는 숫자 ID로 변환하여 처리
                let numericId: number;
                
                // ID가 이미 숫자인 경우
                if (typeof member.id === 'number') {
                    numericId = member.id;
                } 
                // ID가 문자열이지만 숫자로 변환 가능한 경우
                else if (member.id && !isNaN(Number(member.id))) {
                    numericId = Number(member.id);
                } 
                // ID가 없거나 변환 불가능한 경우, username을 키로 사용
                else {
                    console.log(`멤버 ${member.username}의 ID를 숫자로 변환할 수 없어 username을 사용합니다.`);
                    updatedStatus[String(effectiveId)] = Boolean(isCurrentUser);
                    continue;
                }
                
                // 일반 사용자의 경우 서버에서 온라인 상태 정보 가져오기
                const isOnlineFromServer = onlineMembers.includes(numericId);
                console.log(`멤버 ${member.username}(ID: ${numericId}) 서버 온라인 상태:`, isOnlineFromServer);
                
                // 현재 로그인한 사용자는 항상 온라인으로 표시, 그 외에는 서버에서 받은 정보 사용
                const isOnline = isCurrentUser || isOnlineFromServer;
                
                // ID를 문자열로 변환하여 키로 사용
                updatedStatus[String(effectiveId)] = isOnline;
                
                // 로그에 상태 출력
                console.log(`멤버 ${member.username || member.email} (ID: ${effectiveId}) 최종 온라인 상태:`, 
                    isCurrentUser ? '현재 사용자(항상 온라인)' : isOnline ? '온라인' : '오프라인');
            }
            
            console.log('업데이트된 온라인 상태:', updatedStatus);
            setOnlineStatus(updatedStatus);
            
            // 멤버 목록 업데이트
            setMembers(prevMembers => 
                prevMembers.map(member => {
                    // ID가 없으면 username 사용
                    const effectiveId = member.id || member.username;
                    const key = String(effectiveId || '');
                    const isOnline = !!updatedStatus[key];
                    
                    // 현재 사용자인 경우 항상 온라인으로 처리
                    const isCurrentUser = currentUsername && (member.username === currentUsername);
                    const newStatus = (isCurrentUser || isOnline) ? "online" : "offline";
                    
                    return {
                        ...member,
                        status: newStatus
                    };
                })
            );
            
        } catch (error) {
            console.error('온라인 상태 확인 중 오류:', error);
            
            // 오류 발생 시 대체 방법: 현재 사용자만 온라인으로 표시
            if (currentUser) {
                handleFallbackOnlineStatus();
            }
        }
    };
    
    // 현재 사용자의 대체 상태 처리 (오류 발생 시)
    const handleFallbackOnlineStatus = () => {
        console.log('대체 온라인 상태 처리 - 현재 사용자만 온라인으로 설정');
        
        if (!currentUser) return;
        
        const updatedStatus: OnlineStatus = {};
        let currentUserFound = false;
        
        members.forEach(member => {
            // 현재 로그인한 사용자인지 확인하는 로직 강화
            const isCurrentUser = 
                // ID 기반 비교
                (currentUser.id && member.id === currentUser.id) || 
                // 사용자 이름 기반 비교
                member.username === currentUser.username ||
                member.email === currentUser.email ||
                (currentUser.nickname && member.nickname === currentUser.nickname) ||
                member.username === currentUser.usernameFromStorage || 
                // 소셜 로그인 사용자 이메일 패턴 확인
                (member.username && currentUser.username && 
                    (member.username.includes(currentUser.username) || 
                     currentUser.username.includes(member.username)));
            
            // 멤버 ID 처리 - ID가 없으면 username 사용
            const effectiveId = member.id || member.username;
            
            if (isCurrentUser) {
                console.log('현재 사용자 일치:', member.username);
                if (effectiveId) {
                    updatedStatus[String(effectiveId)] = true;
                }
                currentUserFound = true;
            } else {
                if (effectiveId) {
                    updatedStatus[String(effectiveId)] = false; // 다른 사용자는 오프라인
                }
            }
        });
        
        // 멤버 목록 업데이트
        setMembers(prevMembers => 
            prevMembers.map(member => {
                // ID가 없으면 username 사용
                const effectiveId = member.id || member.username;
                const key = effectiveId ? String(effectiveId) : '';
                
                // 현재 사용자인지 확인
                const isCurrentUser = 
                    (currentUser.id && member.id === currentUser.id) || 
                    member.username === currentUser.username ||
                    member.username === currentUser.usernameFromStorage;
                
                return {
                    ...member,
                    status: (isCurrentUser || (key && updatedStatus[key])) ? "online" : "offline"
                };
            })
        );
    };

    const groupConsecutiveMessages = (msgs: Message[]): GroupedMessage[] => {
        const grouped: GroupedMessage[] = [];
        let currentGroup: GroupedMessage | null = null;

        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
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

    // 강제 업데이트를 위한 useEffect
    useEffect(() => {
        if (forceUpdate > 0) {
            console.log('강제 업데이트 트리거됨', forceUpdate);
        }
    }, [forceUpdate]);

    // 엔터 키로 메시지 전송
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
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
                    <div className="workspaceChat-statusGroup" key={`status-group-${status}`}>
                        <div className="workspaceChat-statusHeader">
                            {status === "online" 
                                ? `온라인 - ${members.filter(m => m.status === "online").length}명` 
                                : `오프라인 - ${members.filter(m => m.status === "offline").length}명`}
                        </div>
                        {members
                            .filter((member) => member.status === status)
                            .map((member) => {
                                // 멤버 ID가 문자열이거나 존재하지 않을 경우를 대비한 고유 키 생성
                                const memberKey = `member-${String(member.id || '')}-${member.username || member.email}`;
                                
                                return (
                                    <div className="workspaceChat-member" key={memberKey}>
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
                                            className={`workspaceChat-status-dot ${status === "online" ? "green" : "red"}`}>
                                        </span>
                                        <span className="workspaceChat-name">
                                            {member.nickname || member.username}
                                        </span>
                                    </div>
                                );
                            })}
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
                    <input 
                        type="text" 
                        placeholder="메시지 입력..." 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <div className="workspaceChat-button">📎</div>
                    <div className="workspaceChat-button">😊</div>
                    <div className="workspaceChat-button" onClick={sendMessage}>전송</div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceChat;
