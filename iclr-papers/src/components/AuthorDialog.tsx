import { useState } from 'react';
import { Paper } from '../types';
import { loadUserData, saveUserData } from '../services/dataService';
import { 
    Dialog, DialogTitle, DialogContent, Box, Typography, 
    IconButton, Tooltip
} from '@mui/material';
import { 
    Favorite, FavoriteBorder,
    Person as PersonIcon
} from '@mui/icons-material';
import AuthorCard from './AuthorCard';

interface AuthorDialogProps {
    author: string;
    authorId: string;
    papers: Paper[];
    open: boolean;
    onClose: () => void;
    onPaperClick?: (paper: Paper) => void;
    useSimpleView?: boolean;  // 添加一个选项来控制是使用 AuthorCard 还是简单视图
}

export default function AuthorDialog({ 
    author, 
    authorId, 
    papers, 
    open, 
    onClose, 
    onPaperClick,
    useSimpleView = false
}: AuthorDialogProps) {
    // 如果使用简单视图，则实现收藏功能
    const [isFavorite, setIsFavorite] = useState(() => {
        const userData = loadUserData();
        return userData.favoriteAuthors.includes(authorId);
    });

    const toggleFavorite = () => {
        const userData = loadUserData();
        if (isFavorite) {
            userData.favoriteAuthors = userData.favoriteAuthors.filter(a => a !== authorId);
        } else {
            userData.favoriteAuthors.push(authorId);
        }
        saveUserData(userData);
        setIsFavorite(!isFavorite);
    };

    // 计算作者统计数据
    const getAuthorStats = (papers: Paper[]) => {
        const stats = {
            oral: 0,
            spotlight: 0,
            poster: 0,
            averageScore: 0
        };

        if (papers.length === 0) return stats;

        papers.forEach(paper => {
            if (paper.venue.toLowerCase().includes('oral')) {
                stats.oral++;
            } else if (paper.venue.toLowerCase().includes('spotlight')) {
                stats.spotlight++;
            } else if (paper.venue.toLowerCase().includes('poster')) {
                stats.poster++;
            }
            stats.averageScore += paper.average_rating;
        });

        stats.averageScore = Number((stats.averageScore / papers.length).toFixed(2));
        return stats;
    };

    const stats = getAuthorStats(papers);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            {useSimpleView ? (
                <>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {author}
                            <IconButton onClick={toggleFavorite}>
                                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {/* OpenReview 个人资料链接 */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Tooltip title="View on OpenReview">
                                <Box 
                                    component="a" 
                                    href={`https://openreview.net/profile?id=${authorId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        color: 'text.secondary',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        '&:hover': { 
                                            color: 'primary.main',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    OpenReview Profile
                                </Box>
                            </Tooltip>
                        </Box>

                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {papers.length} papers in ICLR 2025 
                            ({stats.oral} Oral, {stats.spotlight} Spotlight, {stats.poster} Poster)
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Average Score: {stats.averageScore}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {papers.map((paper, index) => (
                                <Typography 
                                    key={index} 
                                    variant="body2" 
                                    sx={{ 
                                        mb: 1,
                                        cursor: onPaperClick ? 'pointer' : 'default',
                                        '&:hover': onPaperClick ? { color: 'primary.main' } : {}
                                    }}
                                    onClick={() => onPaperClick && onPaperClick(paper)}
                                >
                                    • {paper.title}
                                    <Typography component="span" color="textSecondary">
                                        {' '}({paper.venue}, Score: {paper.average_rating})
                                    </Typography>
                                </Typography>
                            ))}
                        </Box>
                    </DialogContent>
                </>
            ) : (
                <DialogTitle sx={{ p: 0 }}>
                    <AuthorCard 
                        author={author} 
                        authorId={authorId}
                        papers={papers}
                        onPaperClick={onPaperClick}
                    />
                </DialogTitle>
            )}
        </Dialog>
    );
}