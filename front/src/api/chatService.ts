import apiClient from './apiClient';

// 채팅 메시지 타입 정의
export interface ChatMessage {
    id?: string;
    chatRoomId: number;
    senderId: number;
    senderName: string;
    content: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE' | 'TYPING';
    timestamp?: Date;
    senderProfileUrl?: string;
}

// 채팅방 메시지 조회 응답 타입
export interface ChatMessagesResponse {
    messages: ChatMessage[];
    totalItems: number;
    totalPages: number;
}

/**
 * 채팅방의 이전 메시지 목록 조회
 * @param chatRoomId 채팅방 ID
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지당 메시지 수
 */
export const getChatMessages = async (
    chatRoomId: number, 
    page: number = 0, 
    size: number = 20
): Promise<ChatMessagesResponse> => {
    try {
        console.log(`채팅방 ${chatRoomId}의 메시지 조회 API 호출 시작 (page: ${page}, size: ${size})`);
        
        const response = await apiClient.get(
            `/api/chat/rooms/${chatRoomId}/messages?page=${page}&size=${size}`
        );
        
        console.log('채팅방 메시지 API 응답:', response);
        
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            console.warn(`채팅방 ${chatRoomId}의 메시지 로드 실패:`, response.data.message);
            // 오류 메시지에도 불구하고 빈 메시지 배열 반환 (화면은 정상 표시)
            return {
                messages: [],
                totalItems: 0,
                totalPages: 0
            };
        }
    } catch (error: any) {
        console.error('채팅 메시지 조회 중 오류:', error);
        
        // 더 자세한 오류 정보 로깅
        if (error.response) {
            console.error('오류 상태 코드:', error.response.status);
            console.error('오류 데이터:', error.response.data);
            
            // 404 오류(채팅방 없음)나 403 오류(권한 없음)의 경우 빈 배열 반환
            if (error.response.status === 404 || error.response.status === 403) {
                console.log('채팅방을 찾을 수 없거나 접근 권한이 없어 빈 메시지 목록을 반환합니다.');
                return {
                    messages: [],
                    totalItems: 0,
                    totalPages: 0
                };
            }
        }
        
        // 여전히 UI를 방해하지 않기 위해 빈 메시지 배열 반환
        console.log('오류 발생으로 빈 메시지 목록을 반환합니다.');
        return {
            messages: [],
            totalItems: 0,
            totalPages: 0
        };
    }
};

/**
 * 채팅방 생성
 */
export const createChatRoom = async (
    workspaceId: number,
    name: string,
    description: string,
    memberIds: number[],
    isDirect: boolean = false
): Promise<any> => {
    try {
        const response = await apiClient.post('/api/chat/rooms', {
            workspaceId,
            name,
            description,
            memberIds,
            isDirect
        });
        
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '채팅방 생성에 실패했습니다.');
        }
    } catch (error) {
        console.error('채팅방 생성 중 오류:', error);
        throw error;
    }
};

/**
 * 워크스페이스의 채팅방 목록 조회
 */
export const getChatRoomsByWorkspace = async (workspaceId: number): Promise<any> => {
    try {
        console.log(`워크스페이스 ${workspaceId}의 채팅방 목록 조회 API 호출 시작`);
        
        // 요청 URL 로깅
        const url = `/api/chat/rooms/workspace/${workspaceId}`;
        console.log('요청 URL:', url);
        
        const response = await apiClient.get(url);
        console.log('채팅방 목록 API 응답:', response);
        
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '채팅방 목록 조회에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('채팅방 목록 조회 중 오류:', error);
        
        // 더 자세한 오류 정보 로깅
        if (error.response) {
            console.error('오류 상태 코드:', error.response.status);
            console.error('오류 데이터:', error.response.data);
        }
        
        throw error;
    }
}; 