import { useState } from 'react';
import { Paper } from '../types';
import { loadUserData, saveUserData } from '../services/dataService';
import { 
    Card, CardContent, Typography, IconButton, Box,
    Link, Tooltip, Collapse, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from '@mui/material';
import { 
    Favorite, FavoriteBorder, 
    ExpandMore, ExpandLess,
    Article as ArticleIcon,
    Comment as CommentIcon
} from '@mui/icons-material';

interface AuthorCardProps {
    author: string;
    papers: Paper[];
    onPaperClick?: (paper: Paper) => void;
}

function getAuthorStats(papers: Paper[]) {
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
}

export default function AuthorCard({ author, papers, onPaperClick }: AuthorCardProps) {
    const [isFavorite, setIsFavorite] = useState(() => {
        const userData = loadUserData();
        return userData.favoriteAuthors.includes(author);
    });
    const [expanded, setExpanded] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [comment, setComment] = useState(() => {
        const userData = loadUserData();
        return userData.authorComments?.[author]?.comments || '';
    });

    const stats = getAuthorStats(papers);

    const toggleFavorite = () => {
        const userData = loadUserData();
        if (isFavorite) {
            userData.favoriteAuthors = userData.favoriteAuthors.filter(a => a !== author);
            // 删除评论
            if (userData.authorComments && userData.authorComments[author]) {
                delete userData.authorComments[author];
            }
        } else {
            userData.favoriteAuthors.push(author);
        }
        saveUserData(userData);
        setIsFavorite(!isFavorite);
    };

    const handleCommentSave = () => {
        const userData = loadUserData();
        // 确保 authorComments 对象存在
        if (!userData.authorComments) {
            userData.authorComments = {};
        }
        // 保存评论
        userData.authorComments[author] = {
            comments: comment,
            timestamp: Date.now()
        };
        saveUserData(userData);
        setCommentDialogOpen(false);
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{author}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isFavorite && (
                            <IconButton onClick={() => setCommentDialogOpen(true)}>
                                <CommentIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={toggleFavorite}>
                            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                        </IconButton>
                    </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {papers.length} papers in ICLR 2025 
                    ({stats.oral} Oral, {stats.spotlight} Spotlight, {stats.poster} Poster)
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Average Score: {stats.averageScore}
                </Typography>
                
                {/* 显示评论（如果有） */}
                {isFavorite && comment && (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'primary.main',
                            mt: 1,
                            p: 1.5,
                            backgroundColor: 'primary.lighter',
                            borderRadius: 1
                        }}
                    >
                        My Notes: {comment}
                    </Typography>
                )}
                
                {/* 展开/折叠按钮 - 只有 startIcon */}
                <Button 
                    startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setExpanded(!expanded)}
                    sx={{ 
                        mt: 1, 
                        textTransform: 'none',
                        color: 'text.secondary'
                    }}
                >
                    {expanded ? 'Hide Papers' : 'Show Papers'}
                </Button>
                
                {/* 论文列表 */}
                <Collapse in={expanded}>
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
                </Collapse>
            </CardContent>

            {/* 评论对话框 */}
            <Dialog 
                open={commentDialogOpen} 
                onClose={() => setCommentDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Author Notes</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Comments"
                        multiline
                        rows={4}
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCommentSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}