import { Paper, UserData } from '../types';

// 从localStorage读取用户数据
export function loadUserData(): UserData {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        try {
            const userData = JSON.parse(storedData);
            console.log('Loaded user data:', userData);
            // 确保所有必需的字段都存在
            if (!userData.authorComments) {
                userData.authorComments = {};
            }
            if (!userData.favoriteAuthors) {
                userData.favoriteAuthors = [];
            }
            if (!userData.favoritePapers) {
                userData.favoritePapers = {};
            }
            return userData;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return {
                favoritePapers: {},
                favoriteAuthors: [],
                authorComments: {}
            };
        }
    }
    return {
        favoritePapers: {},
        favoriteAuthors: [],
        authorComments: {}
    };
}

// 保存用户数据到localStorage
export const saveUserData = (data: UserData) => {
    localStorage.setItem('userData', JSON.stringify(data));
};

// 导出用户数据到本地文件
export const exportUserData = () => {
    const userData = loadUserData();
    const dataString = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iclr_user_data.json';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 从本地文件导入用户数据
export const importUserData = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                const userData = JSON.parse(result) as UserData;
                saveUserData(userData);
                resolve();
            } catch (error) {
                reject(new Error('导入数据失败，文件格式不正确'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('读取文件失败'));
        };
        
        reader.readAsText(file);
    });
};

// 从json文件加载论文数据
export const loadPapers = async (): Promise<Paper[]> => {
    const response = await fetch('/papers.json');
    const data = await response.json();
    return data;
}; 