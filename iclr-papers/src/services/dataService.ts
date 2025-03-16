import { Paper, UserData } from '../types';

// 从localStorage读取用户数据
export function loadUserData(): UserData {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        const userData = JSON.parse(storedData);
        // 确保 authorComments 字段存在
        if (!userData.authorComments) {
            userData.authorComments = {};
        }
        return userData;
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

// 从json文件加载论文数据
export const loadPapers = async (): Promise<Paper[]> => {
    const response = await fetch('/papers.json');
    const data = await response.json();
    return data;
}; 