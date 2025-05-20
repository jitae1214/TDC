"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUsernameFromStorage, getAuthToken } from '../../api/authService';
import { getWorkspaceMembers, getWorkspaces } from '../../api/workspaceService';
import { getChatMessages, ChatMessage as StompChatMessage, getChatRoomsByWorkspace } from '../../api/chatService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './styles.css';

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

// 멤버 타입 정의
type Member = {
    id: number | string;
    username: string;
    email: string;
    nickname?: string;
    profileImageUrl?: string;
    role: string;
};

// 메시지 타입 정의
type Message = {
    id: number;
    sender: string;
    img: string;
    time: string;
    content: string;
};

// 워크스페이스 타입 정의
type Workspace = {
    id: number;
    name: string;
    description?: string;
    iconColor?: string;
    memberCount?: number;
};

// 그룹화된 메시지 타입 정의
type GroupedMessage = {
    id: number;
    sender: string;
    time: string;
    contents: string[];
};

// STOMP 클라이언트 연결 및 구독 관리를 위한 전역 변수
const subscriptionMap = new Map<string, any>(); // 구독 ID 관리
const processedMessages = new Set<string>(); // 처리된 메시지 ID 관리

const DM = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [members, setMembers] = useState<Member[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const stompClientRef = useRef<Client | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
    }, []);

    // 현재 사용자 정보와 워크스페이스 목록 로드
    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            
            // 현재 사용자 정보 로드
            const userResponse = await getCurrentUser();
            let userData = null;
            
            console.log('사용자 정보 응답:', userResponse);
            
            if (userResponse && userResponse.success) {
                userData = userResponse.data;
                
                // 사용자 ID 확인
                if (!userData.id) {
                    console.warn('사용자 ID가 없습니다. 사용자 데이터 구조 확인:', userData);
                    // 사용자 ID가 중첩된 구조에 있을 수 있음
                    if (userData.user && userData.user.id) {
                        userData.id = userData.user.id;
                        console.log('사용자 ID 추출 성공 (user.id):', userData.id);
                    } else if (userData.userId) {
                        userData.id = userData.userId;
                        console.log('사용자 ID 추출 성공 (userId):', userData.id);
                    }
                } else {
                    console.log('사용자 ID 찾음:', userData.id);
                }
                
                setCurrentUser(userData);
            } else if (userResponse && !userResponse.success) {
                console.error('사용자 정보 로드 실패:', userResponse.message || '알 수 없는 오류');
                // 기본 사용자 정보 생성 (임시)
                userData = {
                    id: parseInt(localStorage.getItem('userId') || '0'),
                    username: getUsernameFromStorage(),
                    profileImageUrl: localStorage.getItem('profileImageUrl') || null
                };
                setCurrentUser(userData);
                console.log('기본 사용자 정보 생성:', userData);
            } else {
                userData = userResponse;
                
                // 사용자 ID 확인
                if (!userData.id) {
                    console.warn('사용자 ID가 없습니다. 사용자 데이터 구조 확인:', userData);
                    // 기본 ID 설정
                    userData.id = parseInt(localStorage.getItem('userId') || '0');
                    console.log('기본 사용자 ID 설정:', userData.id);
                }
                
                setCurrentUser(userData);
            }
            
            // 사용자 ID를 로컬 스토리지에 저장 (다른 곳에서 참조용)
            if (userData && userData.id) {
                localStorage.setItem('userId', userData.id.toString());
                console.log('사용자 ID를 로컬 스토리지에 저장:', userData.id);
            }
            
            if (!userData && !localStorage.getItem('userId')) {
                // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
                navigate('/login');
                return;
            }
            
            console.log('사용자 정보 로드 성공:', userData);
            
            // 워크스페이스 목록 로드
            const workspacesResponse = await getWorkspaces();
            if (workspacesResponse && workspacesResponse.workspaces) {
                setWorkspaces(workspacesResponse.workspaces);
                
                // 첫 번째 워크스페이스를 기본 선택
                if (workspacesResponse.workspaces.length > 0) {
                    const firstWorkspace = workspacesResponse.workspaces[0];
                    setSelectedWorkspace(firstWorkspace);
                    
                    // 선택된 워크스페이스의 멤버 목록 로드
                    await loadWorkspaceMembers(firstWorkspace.id);
                    
                    // 워크스페이스에 속한 채팅방 목록 로드
                    await loadChatRooms(firstWorkspace.id);
                }
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('초기 데이터 로드 오류:', error);
            
            // 오류 발생 시 기본 사용자 정보 설정
            const defaultUser = {
                id: parseInt(localStorage.getItem('userId') || '0'),
                username: getUsernameFromStorage(),
                profileImageUrl: localStorage.getItem('profileImageUrl') || null
            };
            
            // 로컬에 저장된 사용자 ID가 있으면 기본 사용자 정보 설정
            if (defaultUser.id > 0 || defaultUser.username) {
                console.log('오류로 인한 기본 사용자 정보 생성:', defaultUser);
                setCurrentUser(defaultUser);
                
                // 기본 워크스페이스 정보 로드 시도
                try {
                    const workspacesResponse = await getWorkspaces();
                    if (workspacesResponse && workspacesResponse.workspaces && workspacesResponse.workspaces.length > 0) {
                        setWorkspaces(workspacesResponse.workspaces);
                        const firstWorkspace = workspacesResponse.workspaces[0];
                        setSelectedWorkspace(firstWorkspace);
                        await loadWorkspaceMembers(firstWorkspace.id);
                        await loadChatRooms(firstWorkspace.id);
                    }
                } catch (wsError) {
                    console.error('워크스페이스 로드 오류:', wsError);
                }
            } else {
                navigate('/login');
            }
            
            setIsLoading(false);
        }
    };

    // 워크스페이스 멤버 목록 로드
    const loadWorkspaceMembers = async (workspaceId: number) => {
        try {
            const membersData = await getWorkspaceMembers(workspaceId);
            setMembers(membersData);
        } catch (error) {
            console.error('워크스페이스 멤버 로드 오류:', error);
        }
    };

    // 워크스페이스의 채팅방 목록 로드
    const loadChatRooms = async (wsId: number) => {
        try {
            console.log(`워크스페이스 ${wsId}의 채팅방 목록 로드 시작`);
            const response = await getChatRoomsByWorkspace(wsId);
            console.log('채팅방 목록 로드 결과:', response);
            
            if (response && response.chatRooms && response.chatRooms.length > 0) {
                setChatRooms(response.chatRooms);
                
                // 워크스페이스 공통 채팅방 찾기 (isDirect가 false인 첫 번째 채팅방 또는 이름에 'general'이 포함된 채팅방)
                const generalRoom = response.chatRooms.find((room: any) => 
                    !room.isDirect && (room.name.toLowerCase().includes('general') || 
                                     room.name.toLowerCase().includes('공통') || 
                                     room.name.toLowerCase().includes('일반'))
                );
                
                // 공통 채팅방이 없으면 isDirect가 false인 첫 번째 채팅방
                const defaultRoom = response.chatRooms.find((room: any) => !room.isDirect);
                
                // 적절한 채팅방 선택
                const selectedRoom = generalRoom || defaultRoom || response.chatRooms[0];
                
                if (selectedRoom) {
                    console.log('선택된 채팅방:', selectedRoom);
                    const roomId = selectedRoom.id;
                    
                    // 채팅방 ID를 로컬 스토리지에 저장
                    localStorage.setItem(`chatRoomId_${wsId}`, roomId.toString());
                    console.log(`채팅방 ID ${roomId}를 워크스페이스 ${wsId}용으로 저장`);
                    
                    setChatRoomId(roomId);
                    
                    // 기존 연결 해제 후 새 연결 수립
                    disconnectFromChat();
                    connectToChat(roomId);
                } else {
                    console.error('적절한 채팅방을 찾을 수 없습니다.');
                    // 채팅방이 없으면 워크스페이스 ID를 채팅방 ID로 사용 (fallback)
                    setChatRoomId(wsId);
                    
                    // 채팅방 ID를 로컬 스토리지에 저장 (fallback)
                    localStorage.setItem(`chatRoomId_${wsId}`, wsId.toString());
                    console.log(`채팅방 ID ${wsId}(fallback)를 워크스페이스 ${wsId}용으로 저장`);
                    
                    disconnectFromChat();
                    connectToChat(wsId);
                    setIsLoading(false);
                }
            } else {
                console.log('채팅방이 없습니다. 워크스페이스 ID를 채팅방 ID로 사용합니다.');
                // 채팅방이 없으면 워크스페이스 ID를 채팅방 ID로 사용
                setChatRoomId(wsId);
                
                // 채팅방 ID를 로컬 스토리지에 저장 (fallback)
                localStorage.setItem(`chatRoomId_${wsId}`, wsId.toString());
                console.log(`채팅방 ID ${wsId}(fallback)를 워크스페이스 ${wsId}용으로 저장`);
                
                disconnectFromChat();
                connectToChat(wsId);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('채팅방 목록 로드 중 오류:', error);
            console.log('에러 발생으로 워크스페이스 ID를 채팅방 ID로 사용합니다.');
            
            // 에러 발생 시 워크스페이스 ID를 채팅방 ID로 대체 사용
            setChatRoomId(wsId);
            
            // 채팅방 ID를 로컬 스토리지에 저장 (fallback)
            localStorage.setItem(`chatRoomId_${wsId}`, wsId.toString());
            console.log(`채팅방 ID ${wsId}(fallback)를 워크스페이스 ${wsId}용으로 저장`);
            
            disconnectFromChat();
            connectToChat(wsId);
            setIsLoading(false);
        }
    };

    // 워크스페이스 선택 변경 처리
    const handleWorkspaceChange = async (workspace: Workspace) => {
        setSelectedWorkspace(workspace);
        await loadWorkspaceMembers(workspace.id);
        
        // 기존 연결 해제
        disconnectFromChat();
        setMessages([]);
        
        // 저장된 채팅방 ID가 있는지 확인
        const savedChatRoomId = localStorage.getItem(`chatRoomId_${workspace.id}`);
        console.log(`워크스페이스 ${workspace.id}의 저장된 채팅방 ID:`, savedChatRoomId);
        
        if (savedChatRoomId) {
            // 저장된 채팅방 ID가 있으면 사용
            const roomId = parseInt(savedChatRoomId);
            console.log('저장된 채팅방 ID 복원:', roomId);
            setChatRoomId(roomId);
            connectToChat(roomId);
        } else {
            // 워크스페이스에 속한 채팅방 목록 로드
            await loadChatRooms(workspace.id);
        }
    };

    // STOMP 클라이언트 연결 설정
    useEffect(() => {
        console.log('채팅방 ID 변경됨:', chatRoomId);
        if (chatRoomId && currentUser) {
            // 채팅방 ID를 로컬 스토리지에 저장
            const selectedWorkspaceId = selectedWorkspace?.id;
            if (selectedWorkspaceId) {
                localStorage.setItem(`chatRoomId_${selectedWorkspaceId}`, chatRoomId.toString());
                console.log(`채팅방 ID ${chatRoomId}를 워크스페이스 ${selectedWorkspaceId}용으로 저장`);
            }
            
            // 기존 연결 해제 후 새 연결 수립
            disconnectFromChat();
            connectToChat(chatRoomId);
        }
        
        return () => {
            disconnectFromChat();
            // 컴포넌트 언마운트 시 모든 전역 상태 초기화
            subscriptionMap.clear();
            processedMessages.clear();
        };
    }, [chatRoomId, currentUser, selectedWorkspace?.id]);

    // STOMP 클라이언트 연결 함수 - 연결 관리 강화
    const connectToChat = (roomId: number) => {
        // 이미 연결되어 있는 경우 연결 해제 먼저 수행
        disconnectFromChat();
        
        const token = getAuthToken();
        if (!token || !roomId) return;

        console.log('새 STOMP 클라이언트 생성 시작, 채팅방 ID:', roomId);
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
            
            // 구독 식별자
            const subscriptionId = `/topic/chat/${roomId}`;
            
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
                        img: receivedMessage.senderProfileUrl || '/default-avatar.png',
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

            // 이전 메시지 로드
            loadPreviousMessages(roomId);

            // 채팅방 입장 메시지는 연결 후 한 번만 전송
            if (currentUser) {
                setTimeout(() => {
                    console.log('입장 메시지 전송 준비...');
                    console.log('현재 사용자 정보:', currentUser);
                    
                    // 사용자 ID 추출 (data 객체 안에 있을 수 있음)
                    const userId = currentUser.id || (currentUser.data && currentUser.data.id);
                    
                    if (!userId) {
                        console.error('사용자 ID를 찾을 수 없습니다:', currentUser);
                        return;
                    }
                    
                    const joinMessage: ChatMessage = {
                        chatRoomId: roomId,
                        senderId: userId,
                        senderName: currentUser.username || 
                                  (currentUser.data && currentUser.data.username) || 
                                  getUsernameFromStorage() || 
                                  '알 수 없는 사용자',
                        content: 'DM 채팅방에 입장했습니다.',
                        type: 'JOIN',
                        senderProfileUrl: currentUser.profileImageUrl || 
                                        (currentUser.data && currentUser.data.profileImageUrl),
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
                        console.log('입장 메시지 전송 완료!', joinMessage);
                        
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

    // 이전 메시지 로드 함수
    const loadPreviousMessages = async (roomId: number) => {
        try {
            console.log('이전 메시지 로드 시작...', roomId);
            setLoadingMessages(true);
            
            if (!roomId) {
                console.error('채팅방 ID가 유효하지 않습니다:', roomId);
                setIsLoading(false);
                setLoadingMessages(false);
                return;
            }
            
            const response = await getChatMessages(roomId);
            console.log('이전 메시지 로드 성공:', response);
            
            if (response && response.messages && response.messages.length > 0) {
                const previousMessages = response.messages.map(msg => ({
                    id: parseInt(msg.id || '0') || Date.now(),
                    sender: msg.senderName,
                    img: msg.senderProfileUrl || '/default-avatar.png',
                    time: new Date(msg.timestamp || Date.now()).toLocaleTimeString(),
                    content: msg.content
                }));
                
                // 이전 메시지는 배열을 뒤집어서 새로운 메시지가 아래에 표시되도록 함
                // 백엔드에서 내림차순으로 반환하므로 다시 뒤집어 시간순으로 정렬
                setMessages(previousMessages.reverse());
                
                // 처리된 메시지 ID 등록
                response.messages.forEach(msg => {
                    if (msg.id) {
                        const messageId = `${msg.senderName}-${msg.content}-${msg.timestamp || Date.now()}`;
                        processedMessages.add(messageId);
                    }
                });
                
                console.log(`${previousMessages.length}개의 이전 메시지를 로드했습니다.`);
            } else {
                console.log('이전 메시지가 없습니다. 빈 메시지 목록으로 초기화합니다.');
                setMessages([]); // 빈 메시지 목록으로 초기화
            }
            
            // 최초 로딩 완료 표시
            setIsLoading(false);
            
            // 초기 메시지 로드 후 스크롤을 아래로 이동
            setTimeout(() => {
                if (chatBodyRef.current) {
                    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                }
            }, 100);
        } catch (error) {
            console.error('이전 메시지 로드 중 오류:', error);
            console.warn('오류가 발생했지만 채팅 기능은 계속 사용할 수 있습니다.');
            setMessages([]); // 오류 발생 시 빈 메시지 목록으로 초기화
            setIsLoading(false);
        } finally {
            setLoadingMessages(false);
        }
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
                            content: 'DM 채팅방에서 퇴장했습니다.',
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
        if (!inputMessage.trim() || !stompClientRef.current || !stompClientRef.current.connected || !chatRoomId) return;
        
        if (!currentUser) {
            console.error('사용자 정보가 없습니다.');
            return;
        }
        
        const now = new Date();
        
        // 사용자 ID 추출 (data 객체 안에 있을 수 있음)
        const userId = currentUser.id || (currentUser.data && currentUser.data.id);
        
        if (!userId) {
            console.error('사용자 ID를 찾을 수 없습니다:', currentUser);
            return;
        }
        
        const chatMessage: ChatMessage = {
            chatRoomId: chatRoomId,
            senderId: userId,
            senderName: currentUser.username || 
                      (currentUser.data && currentUser.data.username) || 
                      getUsernameFromStorage() || 
                      '알 수 없는 사용자',
            content: inputMessage,
            type: 'CHAT',
            senderProfileUrl: currentUser.profileImageUrl || 
                            (currentUser.data && currentUser.data.profileImageUrl),
            timestamp: now
        };
        
        console.log('전송할 메시지:', chatMessage);
        
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

    // 엔터 키로 메시지 전송
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // 메시지 그룹화 함수
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

    // 메시지 스크롤 자동 이동
    useEffect(() => {
        if (chatBodyRef.current && !loadingMessages) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, loadingMessages]);

    const groupedMessages = groupConsecutiveMessages(messages);

    if (isLoading) {
        return <div className="dm-loading">로딩 중...</div>;
    }

    return (
        <div className="dm-container">
            {/* 워크스페이스 선택 */}
            <div className="dm-workspace-selector">
                <h2>워크스페이스</h2>
                <div className="dm-workspace-list">
                    {workspaces.map(workspace => (
                        <div 
                            key={workspace.id} 
                            className={`dm-workspace-item ${selectedWorkspace?.id === workspace.id ? 'selected' : ''}`}
                            onClick={() => handleWorkspaceChange(workspace)}
                        >
                            <div 
                                className="dm-workspace-icon" 
                                style={{ backgroundColor: workspace.iconColor || '#4a154b' }}
                            >
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="dm-workspace-details">
                                <div className="dm-workspace-name">{workspace.name}</div>
                                <div className="dm-workspace-members">{workspace.memberCount || 0} 명의 멤버</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 채팅 영역 */}
            <div className="dm-chat-area">
                <div className="dm-chat-header">
                    <h2>{selectedWorkspace ? selectedWorkspace.name : '워크스페이스 선택'} - 단체 메시지</h2>
                    <div className="dm-chat-members">
                        {members.length} 명의 멤버가 참여 중
                    </div>
                </div>
                
                <div className="dm-chat-body" ref={chatBodyRef}>
                    {isLoading ? (
                        <div className="dm-loading-messages">메시지를 불러오는 중...</div>
                    ) : groupedMessages.length === 0 ? (
                        <div className="dm-no-messages">
                            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                        </div>
                    ) : (
                        <div className="dm-messages">
                            {loadingMessages && (
                                <div className="dm-loading-more">이전 메시지 불러오는 중...</div>
                            )}
                            {groupedMessages.map((group) => (
                                <div key={group.id} className="dm-message-group">
                                    <div className="dm-message-avatar">
                                        <img src={getSenderImageUrl(group)} alt={group.sender} />
                                    </div>
                                    <div className="dm-message-content">
                                        <div className="dm-message-header">
                                            <span className="dm-message-sender">{group.sender}</span>
                                            <span className="dm-message-time">{group.time}</span>
                                        </div>
                                        <div className="dm-message-text">
                                            {group.contents.map((content, i) => (
                                                <div key={i}>{content}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="dm-chat-input">
                    <input 
                        type="text" 
                        placeholder="메시지 입력..." 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={sendMessage}>전송</button>
                </div>
            </div>
            
            {/* 멤버 목록 영역 */}
            <div className="dm-members-area">
                <h2>멤버 목록</h2>
                <div className="dm-members-list">
                    {members.map(member => (
                        <div key={member.id} className="dm-member-item">
                            <div className="dm-member-avatar">
                                {member.profileImageUrl ? (
                                    <img src={member.profileImageUrl} alt={member.username} />
                                ) : (
                                    <div className="dm-member-initial">
                                        {getInitial(member)}
                                    </div>
                                )}
                            </div>
                            <div className="dm-member-info">
                                <div className="dm-member-name">{member.nickname || member.username}</div>
                                <div className="dm-member-email">{member.email}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    // 사용자 이니셜 가져오기
    function getInitial(member: Member) {
        return (member.nickname || member.username || member.email || '').charAt(0).toUpperCase();
    }
    
    // 프로필 이미지 URL 가져오기
    function getSenderImageUrl(group: GroupedMessage) {
        const senderMember = members.find(m => m.username === group.sender || m.nickname === group.sender);
        return senderMember?.profileImageUrl || '/default-avatar.png';
    }
};

export default DM; 