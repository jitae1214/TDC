import apiClient from './apiClient';

interface CreateWorkspaceRequest {
  name: string;
  description: string;
  iconColor: string;
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

// 워크스페이스 생성
export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<Workspace> => {
  const response = await apiClient.post('/api/workspaces', data);
  return response.data;
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
export const addWorkspaceMember = async (id: number, username: string): Promise<WorkspaceMember> => {
  const response = await apiClient.post(`/api/workspaces/${id}/members`, { username });
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