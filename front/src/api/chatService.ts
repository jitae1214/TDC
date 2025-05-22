import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAuthToken } from './apiClient';
import apiClient from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const SOCKET_URL = `${API_BASE_URL}/ws`;

let stompClient: Client | null = null;
let chatSubscription: StompSubscription | null = null;
let typingSubscription: StompSubscription | null = null;
let statusSubscription: StompSubscription | null = null;

// 메시지 핸들러 콜백 함수 타입 정의
type MessageHandler = (message: any) => void;
type ConnectionStatusHandler = (connected: boolean) => void;

let messageCallback: MessageHandler | null = null;
let typingCallback: MessageHandler | null = null;
let connectionStatusCallback: ConnectionStatusHandler | null = null;
let statusCallback: MessageHandler | null = null;

// WebSocket 연결 설정
export const connectWebSocket = (onConnectionStatus?: ConnectionStatusHandler) => {
  if (connectionStatusCallback !== onConnectionStatus && onConnectionStatus) {
    connectionStatusCallback = onConnectionStatus;
  }

  if (stompClient && stompClient.connected) {
    console.log('WebSocket 이미 연결됨');
    connectionStatusCallback && connectionStatusCallback(true);
    return;
  }

  const socket = new SockJS(SOCKET_URL);
  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    debug: (msg) => {
      console.log('STOMP 디버그: ', msg);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  });

  stompClient.onConnect = () => {
    console.log('WebSocket 연결 성공');
    connectionStatusCallback && connectionStatusCallback(true);
  };

  stompClient.onStompError = (frame) => {
    console.error('STOMP 오류: ', frame);
    connectionStatusCallback && connectionStatusCallback(false);
  };

  stompClient.onWebSocketClose = () => {
    console.log('WebSocket 연결 종료');
    connectionStatusCallback && connectionStatusCallback(false);
  };

  stompClient.activate();
};

// 채팅방 구독
export const subscribeToChatRoom = (chatRoomId: number, onMessageReceived: MessageHandler, onTyping?: MessageHandler) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    connectWebSocket(() => {
      // 연결 후 다시 시도
      subscribeToChatRoom(chatRoomId, onMessageReceived, onTyping);
    });
    return;
  }

  // 이전 구독 취소
  unsubscribeFromChatRoom();

  messageCallback = onMessageReceived;
  typingCallback = onTyping || null;

  // 채팅 메시지 구독
  chatSubscription = stompClient.subscribe(
    `/topic/chat/${chatRoomId}`,
    (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        console.log('새 메시지 수신: ', receivedMessage);
        if (messageCallback) {
          messageCallback(receivedMessage);
        }
      } catch (error) {
        console.error('메시지 파싱 오류: ', error);
      }
    }
  );

  // 타이핑 이벤트 구독 (선택적)
  if (onTyping) {
    typingSubscription = stompClient.subscribe(
      `/topic/chat/${chatRoomId}/typing`,
      (message) => {
        try {
          const typingData = JSON.parse(message.body);
          console.log('타이핑 이벤트: ', typingData);
          if (typingCallback) {
            typingCallback(typingData);
          }
        } catch (error) {
          console.error('타이핑 메시지 파싱 오류: ', error);
        }
      }
    );
  }
};

// 사용자 상태 변경 구독
export const subscribeToUserStatus = (chatRoomId: number, onStatusChange: MessageHandler) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    connectWebSocket(() => {
      // 연결 후 다시 시도
      subscribeToUserStatus(chatRoomId, onStatusChange);
    });
    return;
  }

  // 이전 상태 구독 취소
  if (statusSubscription) {
    statusSubscription.unsubscribe();
    statusSubscription = null;
  }

  statusCallback = onStatusChange;

  // 상태 변경 구독
  statusSubscription = stompClient.subscribe(
    `/topic/chat/${chatRoomId}/status`,
    (message) => {
      try {
        const statusData = JSON.parse(message.body);
        console.log('사용자 상태 변경: ', statusData);
        if (statusCallback) {
          statusCallback(statusData);
        }
      } catch (error) {
        console.error('상태 메시지 파싱 오류: ', error);
      }
    }
  );
};

// 워크스페이스 전체 사용자 상태 변경 구독
export const subscribeToWorkspaceStatus = (workspaceId: number, onStatusChange: MessageHandler) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    connectWebSocket(() => {
      // 연결 후 다시 시도
      subscribeToWorkspaceStatus(workspaceId, onStatusChange);
    });
    return;
  }

  // 워크스페이스 상태 변경 구독
  const workspaceStatusSub = stompClient.subscribe(
    `/topic/workspace/${workspaceId}/status`,
    (message) => {
      try {
        const statusData = JSON.parse(message.body);
        console.log('워크스페이스 사용자 상태 변경: ', statusData);
        onStatusChange(statusData);
      } catch (error) {
        console.error('상태 메시지 파싱 오류: ', error);
      }
    }
  );

  return () => {
    if (workspaceStatusSub) {
      workspaceStatusSub.unsubscribe();
    }
  };
};

// 전체 사용자 상태 변경 구독
export const subscribeToAllUserStatus = (onStatusChange: MessageHandler) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    connectWebSocket(() => {
      // 연결 후 다시 시도
      subscribeToAllUserStatus(onStatusChange);
    });
    return;
  }

  // 전체 사용자 상태 변경 구독
  const allStatusSub = stompClient.subscribe(
    `/topic/users/status`,
    (message) => {
      try {
        const statusData = JSON.parse(message.body);
        console.log('전체 사용자 상태 변경: ', statusData);
        onStatusChange(statusData);
      } catch (error) {
        console.error('상태 메시지 파싱 오류: ', error);
      }
    }
  );

  return () => {
    if (allStatusSub) {
      allStatusSub.unsubscribe();
    }
  };
};

// 사용자 상태 변경 전송
export const sendUserStatusUpdate = (chatRoomId: number, username: string, status: string) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return false;
  }

  const statusMessage = {
    chatRoomId,
    username,
    status,
    timestamp: new Date()
  };

  stompClient.publish({
    destination: '/app/chat.updateStatus',
    body: JSON.stringify(statusMessage)
  });

  return true;
};

// 채팅방 구독 취소
export const unsubscribeFromChatRoom = () => {
  if (chatSubscription) {
    chatSubscription.unsubscribe();
    chatSubscription = null;
  }

  if (typingSubscription) {
    typingSubscription.unsubscribe();
    typingSubscription = null;
  }

  if (statusSubscription) {
    statusSubscription.unsubscribe();
    statusSubscription = null;
  }

  messageCallback = null;
  typingCallback = null;
  statusCallback = null;
};

// 메시지 전송
export const sendChatMessage = (chatRoomId: number, senderId: number, content: string, senderName: string, senderProfileUrl?: string) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return false;
  }

  const message = {
    chatRoomId,
    senderId,
    senderName,
    content,
    senderProfileUrl,
    type: 'CHAT',
    timestamp: new Date()
  };

  stompClient.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify(message)
  });

  return true;
};

// 타이핑 이벤트 전송
export const sendTypingEvent = (chatRoomId: number, senderId: number, senderName: string) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return;
  }

  const message = {
    chatRoomId,
    senderId,
    senderName,
    type: 'TYPING',
    timestamp: new Date()
  };

  stompClient.publish({
    destination: '/app/chat.typing',
    body: JSON.stringify(message)
  });
};

// 채팅방 입장 메시지 전송
export const sendJoinMessage = (chatRoomId: number, senderId: number, senderName: string, senderProfileUrl?: string) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되어 있지 않습니다.');
    return;
  }

  const message = {
    chatRoomId,
    senderId,
    senderName,
    senderProfileUrl,
    content: `${senderName}님이 입장했습니다.`,
    type: 'JOIN',
    timestamp: new Date()
  };

  stompClient.publish({
    destination: '/app/chat.addUser',
    body: JSON.stringify(message)
  });
};

// WebSocket 연결 해제
export const disconnectWebSocket = () => {
  unsubscribeFromChatRoom();
  
  if (stompClient) {
    if (stompClient.connected) {
      stompClient.deactivate();
    }
    stompClient = null;
  }
  
  connectionStatusCallback = null;
  console.log('WebSocket 연결 해제됨');
};

// HTTP API를 통한 채팅방 메시지 로드
export const loadChatMessages = async (chatRoomId: number, page: number = 0, size: number = 20, workspaceId?: number) => {
  try {
    const token = getAuthToken();
    let url = `${API_BASE_URL}/api/chat/rooms/${chatRoomId}/messages?page=${page}&size=${size}`;
    
    // 워크스페이스 ID가 제공된 경우 URL에 추가
    if (workspaceId) {
      url += `&workspaceId=${workspaceId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('메시지 로드 실패');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('채팅 메시지 로드 중 오류:', error);
    throw error;
  }
};

// 워크스페이스의 채팅방 목록 조회
export const getChatRooms = async (workspaceId: number) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      // 토큰이 아예 없는 경우에만 로그인 페이지로 리다이렉트
      if (!localStorage.getItem('username')) {
        window.location.href = '/login';
      }
      return [];
    }
    
    console.log(`채팅방 목록 요청 - 워크스페이스 ID: ${workspaceId}, 토큰: ${token ? '있음' : '없음'}`);
    
    const response = await apiClient.get(`/api/chat/rooms/workspace/${workspaceId}`);
    
    if (!response.data || !response.data.success) {
      console.warn('채팅방 목록 로드 실패:', response.data?.message || '알 수 없는 오류');
      return [];
    }
    
    console.log('채팅방 목록 로드 성공:', response.data);
    
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.warn('채팅방 데이터가 예상 형식이 아닙니다:', response.data);
      return [];
    }
    
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      console.error('채팅방 목록 접근 권한이 없습니다. Fallback 채팅방을 사용합니다.');
      // 소셜 로그인 이후에도 작동할 수 있도록 리다이렉트하지 않고 빈 배열 반환
      return [];
    }
    
    console.error('채팅방 목록 로드 중 오류:', error);
    return [];
  }
};

// 사용자 상태 업데이트 (REST API)
export const updateUserStatus = async (status: string) => {
  try {
    const response = await apiClient.put('/api/users/status', { status });
    
    if (response.data.success) {
      console.log('사용자 상태 업데이트 성공:', response.data.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('사용자 상태 업데이트 오류:', error);
    throw error;
  }
};

// 특정 사용자의 상태 조회
export const getUserStatus = async (userId: number) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/status`);
    
    return response.data.data;
  } catch (error) {
    console.error('사용자 상태 조회 오류:', error);
    throw error;
  }
};

// 워크스페이스의 온라인 사용자 목록 조회
export const getWorkspaceOnlineUsers = async (workspaceId: number) => {
  try {
    const response = await apiClient.get(`/api/users/workspace/${workspaceId}/online`);
    
    return response.data.data;
  } catch (error) {
    console.error('워크스페이스 온라인 사용자 조회 오류:', error);
    throw error;
  }
}; 