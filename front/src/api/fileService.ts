import apiClient, { getAuthToken } from './apiClient';

/**
 * 프로필 이미지 업로드
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지 URL
 */
export const uploadProfileImage = async (file: File): Promise<string> => {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    
    // 인증 토큰 설정
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };
    
    // 요청 전송
    const response = await apiClient.post('/api/files/upload/profile', formData, config);
    
    // 응답에서 파일 URL 추출
    if (response.data && response.data.fileUrl) {
      return response.data.fileUrl;
    }
    
    throw new Error('파일 URL을 받지 못했습니다.');
  } catch (error: any) {
    console.error('프로필 이미지 업로드 실패:', error);
    throw new Error('프로필 이미지 업로드 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
  }
};

/**
 * 워크스페이스 이미지 업로드
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지 URL
 */
export const uploadWorkspaceImage = async (file: File): Promise<string> => {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    
    // 인증 토큰 설정
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };
    
    // 요청 전송
    const response = await apiClient.post('/api/files/upload/workspace', formData, config);
    
    // 응답에서 파일 URL 추출
    if (response.data && response.data.fileUrl) {
      return response.data.fileUrl;
    }
    
    throw new Error('파일 URL을 받지 못했습니다.');
  } catch (error: any) {
    console.error('워크스페이스 이미지 업로드 실패:', error);
    throw new Error('워크스페이스 이미지 업로드 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
  }
};

/**
 * 프로필 이미지 URL을 DB에 업데이트
 * @param imageUrl 업로드된 이미지 URL
 * @returns 업데이트 결과
 */
export const updateUserProfileImage = async (imageUrl: string): Promise<any> => {
  try {
    // uc778uc99d ud1a0ud070 uc124uc815
    const token = getAuthToken();
    if (!token) {
      console.error('uc778uc99d ud1a0ud070uc774 uc5c6uc2b5ub2c8ub2e4.');
      throw new Error('uc778uc99d ud1a0ud070uc744 ubc1bubc25 ubabb96uc5c8uc2b5ub2c8ub2e4.');
    }
    
    // uc0acuc6a9uc790 ID ud655uc778
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // uc694uccaduc5d0 uc0acuc6a9uc790 ID/username uc815ubcf4 ucd94uac00
    const requestData = {
      imageUrl,
      userId,
      username
    };
    
    console.log('ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub370uc774ud2b8 uc694uccad ub370uc774ud130:', requestData);
    
    const response = await apiClient.post('/api/users/profile-image', requestData, config);
    
    // ub85cuceec uc2a4ud1a0ub9acuc9c0uc5d0ub3c4 uc800uc7a5
    if (response.data && response.data.success) {
      const currentUsername = localStorage.getItem('username') || '';
      if (currentUsername) {
        // uc0acuc6a9uc790ubcc4 uc774ubbf8uc9c0 uc800uc7a5 (userSpecificImageKey)
        const userSpecificImageKey = `profileImage_${currentUsername}`;
        localStorage.setItem(userSpecificImageKey, imageUrl);
        
        // uc77cubc18 ud0a4uc5d0ub3c4 uc800uc7a5 (ud558uc704 ud638ud658uc131)
        localStorage.setItem('profileImage', imageUrl);
        
        console.log('ud504ub85cud544 uc774ubbf8uc9c0 URLuc774 ub85cuceec uc2a4ud1a0ub9acuc9c0uc5d0 uc800uc7a5ub418uc5c8uc2b5ub2c8ub2e4.', imageUrl);
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8 uc2e4ud328:', error);
    throw new Error('ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8 uc911 uc624ub958uac00 ubc1cuc0ddud588uc2b5ub2c8ub2e4: ' + (error.message || 'uc54c uc218 uc5c6ub294 uc624ub958'));
  }
};

/**
 * ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub85cub4dc ubc0f DB uc5c5ub370uc774ud2b8 (ud1b5ud569 ud568uc218)
 * @param file uc5c5ub85cub4dcud560 uc774ubbf8uc9c0 ud30cuc77c
 * @returns uc5c5ub370uc774ud2b8 uacb0uacfc
 */
export const uploadAndUpdateProfileImage = async (file: File): Promise<any> => {
  try {
    // ud1a0ud070 uc720ud6a8uc131 ud655uc778
    const token = getAuthToken();
    if (!token) {
      console.error('uc778uc99d ud1a0ud070uc774 uc5c6uc2b5ub2c8ub2e4. ub85cuadf8uc778uc774 ud544uc694ud569ub2c8ub2e4.');
      return { success: false, message: 'ub85cuadf8uc778uc774 ud544uc694ud569ub2c8ub2e4.' };
    }
    
    // FormData uc0dduc131
    const formData = new FormData();
    formData.append('file', file);
    
    // uc778uc99d ud1a0ud070 uc124uc815
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // 1. uc774ubbf8uc9c0 ud30cuc77c uc5c5ub85cub4dc
    const uploadResponse = await apiClient.post('/api/files/upload/profile', formData, config);
    
    if (!uploadResponse.data || !uploadResponse.data.fileUrl) {
      throw new Error('ud30cuc77c URL uc751ub2f5uc774 uc62cubc14ub974uc9c0 uc54auc740 ud615uc2dduc785ub2c8ub2e4.');
    }
    
    const imageUrl = uploadResponse.data.fileUrl;
    console.log('uc774ubbf8uc9c0 uc5c5ub85cub4dc uc131uacf5:', imageUrl);
    
    // 2. uc0acuc6a9uc790 ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8
    const updateResponse = await apiClient.post('/api/users/profile-image', 
      { 
        imageUrl,
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8 uc751ub2f5:', updateResponse.data);
    
    // ub85cuceec uc2a4ud1a0ub9acuc9c0uc5d0ub3c4 uc800uc7a5
    const currentUsername = localStorage.getItem('username') || '';
    if (currentUsername) {
      // uc0acuc6a9uc790ubcc4 uc774ubbf8uc9c0 uc800uc7a5
      const userSpecificImageKey = `profileImage_${currentUsername}`;
      localStorage.setItem(userSpecificImageKey, imageUrl);
      
      // uc77cubc18 ud0a4uc5d0ub3c4 uc800uc7a5 (ud558uc704 ud638ud658uc131)
      localStorage.setItem('profileImage', imageUrl);
      
      console.log('ud504ub85cud544 uc774ubbf8uc9c0 URLuc774 ub85cuceec uc2a4ud1a0ub9acuc9c0uc5d0 uc800uc7a5ub418uc5c8uc2b5ub2c8ub2e4:', imageUrl);
    }
    
    return updateResponse.data;
  } catch (error: any) {
    console.error('ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub85cub4dc ubc0f uc5c5ub370uc774ud2b8 uc2e4ud328:', error);
    
    // uc778uc99d uad00ub828 uc624ub958 ucc98ub9ac
    if (error.response && error.response.status === 403) {
      console.error('uc811uadfc uad8cud55cuc774 uc5c6uc2b5ub2c8ub2e4. ub2e4uc2dc ub85cuadf8uc778ud574uc8fcuc138uc694.');
      return { success: false, message: 'uc778uc99d uc624ub958uac00 ubc1cuc0ddud588uc2b5ub2c8ub2e4. ub2e4uc2dc ub85cuadf8uc778ud574uc8fcuc138uc694.' };
    }
    
    throw new Error('ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub85cub4dc ubc0f uc5c5ub370uc774ud2b8 uc911 uc624ub958uac00 ubc1cuc0ddud588uc2b5ub2c8ub2e4: ' + (error.message || 'uc54c uc218 uc5c6ub294 uc624ub958'));
  }
}; 