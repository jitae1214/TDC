import apiClient, { getAuthToken } from './apiClient';

/**
 * ud504ub85cud544 uc774ubbf8uc9c0 uc5c5ub85cub4dc ubc0f DB uc5c5ub370uc774ud2b8 (ud1b5ud569 ud568uc218)
 * @param file uc5c5ub85cub4dcud560 uc774ubbf8uc9c0 ud30cuc77c
 * @returns uc5c5ub370uc774ud2b8 uacb0uacfc
 */
export const uploadAndUpdateProfileImageWithRetry = async (file: File): Promise<any> => {
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
      throw new Error('ud30cuc77c URL uc751ub2f5uc774 uc62cub9acuc9c0 uc54auc740 ud615uc2dcuc785ub2c8ub2e4.');
    }
    
    const imageUrl = uploadResponse.data.fileUrl;
    console.log('uc774ubbf8uc9c0 uc5c5ub85cub4dc uc131uacf5:', imageUrl);
    
    // 2. uc0acuc6a9uc790 ud504ub85cud544 uc774ubbf8uc9c0 URL uc5c5ub370uc774ud2b8
    const updateResponse = await apiClient.post('/api/users/profile-image', 
      { imageUrl },
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