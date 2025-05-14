import apiClient, { getAuthToken } from './apiClient';

interface CreateWorkspaceRequest {
  name: string;
  description: string;
  iconColor: string;
  displayName?: string;
}

interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  iconColor?: string;
}

interface WorkspaceMember {
  id: number;
  username: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
  iconColor: string;
  memberCount: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceListResponse {
  workspaces: Workspace[];
  totalCount: number;
  ownedCount: number;
  joinedCount: number;
}

// 워크스페이스 목록 조회
export const getWorkspaces = async (type: string = 'all'): Promise<WorkspaceListResponse> => {
  const response = await apiClient.get(`/api/workspaces?type=${type}`);
  return response.data;
};

// 워크스페이스 단일 조회
export const getWorkspace = async (id: number): Promise<Workspace> => {
  const response = await apiClient.get(`/api/workspaces/${id}`);
  return response.data;
};

// 워크스페이스 생성 (FormData 지원)
export const createWorkspace = async (data: CreateWorkspaceRequest | FormData): Promise<Workspace> => {
  // FormData 객체인지 확인
  const isFormData = data instanceof FormData;
  
  // 인증 토큰 가져오기
  const token = getAuthToken();
  
  // FormData인 경우 별도의 헤더 설정이 필요
  const config = isFormData ? {
    headers: {
      'Content-Type': 'multipart/form-data',
      // FormData일 때도 Authorization 헤더 추가
      'Authorization': token ? `Bearer ${token}` : '',
    },
  } : undefined;
  
  try {
    console.log('워크스페이스 생성 요청:', isFormData ? '(FormData)' : data);
    
    // API 엔드포인트 확인을 위한 로깅
    console.log('API 엔드포인트:', '/api/workspaces');
    console.log('인증 토큰 존재:', !!token);
    
    const response = await apiClient.post('/api/workspaces', data, config);
    console.log('워크스페이스 생성 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('워크스페이스 생성 중 오류:', error);
    
    // 에러 상세 정보 로깅
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    
    throw error;
  }
};

// 워크스페이스 수정
export const updateWorkspace = async (id: number, data: UpdateWorkspaceRequest): Promise<Workspace> => {
  const response = await apiClient.put(`/api/workspaces/${id}`, data);
  return response.data;
};

// 워크스페이스 삭제
export const deleteWorkspace = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/workspaces/${id}`);
};

// 워크스페이스 멤버 목록 조회
export const getWorkspaceMembers = async (id: number): Promise<WorkspaceMember[]> => {
  const response = await apiClient.get(`/api/workspaces/${id}/members`);
  return response.data;
};

// 워크스페이스 멤버 추가
export const addWorkspaceMember = async (
  id: number, 
  userIdentifier: string, 
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
): Promise<WorkspaceMember> => {
  const response = await apiClient.post(`/api/workspaces/${id}/members`, { 
    userIdentifier, 
    role 
  });
  return response.data;
};

// 워크스페이스 멤버 역할 변경
export const updateMemberRole = async (workspaceId: number, userId: number, role: string): Promise<WorkspaceMember> => {
  const response = await apiClient.put(`/api/workspaces/${workspaceId}/members/${userId}/role`, { role });
  return response.data;
};

// 워크스페이스 멤버 제거
export const removeMember = async (workspaceId: number, userId: number): Promise<void> => {
  await apiClient.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
};

// 워크스페이스 나가기
export const leaveWorkspace = async (id: number): Promise<void> => {
  await apiClient.post(`/api/workspaces/${id}/leave`);
};

// 워크스페이스 이름 중복 체크
export const checkWorkspaceName = async (name: string): Promise<boolean> => {
  const response = await apiClient.get(`/api/workspaces/check-name?name=${encodeURIComponent(name)}`);
  return response.data;
};

// 최근 생성된 워크스페이스 목록 조회
export const getRecentWorkspaces = async (limit: number = 5): Promise<Workspace[]> => {
  const response = await apiClient.get(`/api/workspaces/recent?limit=${limit}`);
  return response.data;
}; 