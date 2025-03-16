import { useState, useEffect } from 'react';
import { Paper, PaperComment } from '../types';
import { loadUserData, saveUserData } from '../services/dataService';
import { 
    Card, CardContent, Typography, IconButton, Collapse,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Rating, ToggleButtonGroup, ToggleButton,
    Box, Link, Tooltip 
} from '@mui/material';
import { 
    Favorite, FavoriteBorder, ExpandMore, ExpandLess,
    Comment as CommentIcon, Launch as LaunchIcon,
    Description as DescriptionIcon,
    Person as PersonIcon 
} from '@mui/icons-material';

interface AuthorStats {
    oral: number;
    spotlight: number;
    poster: number;
    averageScore: number;
}

function getAuthorStats(papers: Paper[]): AuthorStats {
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

interface AuthorDialogProps {
    author: string;
    authorId: string;
    papers: Paper[];
    open: boolean;
    onClose: () => void;
}

function AuthorDialog({ author, authorId, papers, open, onClose }: AuthorDialogProps) {
    const [isFavorite, setIsFavorite] = useState(() => {
        const userData = loadUserData();
        return userData.favoriteAuthors.includes(authorId);
    });

    const stats = getAuthorStats(papers);

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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {author}
                    <IconButton onClick={toggleFavorite}>
                        {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
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
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {paper.title}
                            <Typography component="span" color="textSecondary">
                                {' '}({paper.venue}, Score: {paper.average_rating})
                            </Typography>
                        </Typography>
                    ))}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

interface PaperCardProps {
    paper: Paper;
    allPapers?: Paper[];  // 添加这个属性来获取所有论文
}

export default function PaperCard({ paper, allPapers = [] }: PaperCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
    const [paperData, setPaperData] = useState<PaperComment>({
        status: null,
        rating: null,
        comments: '',
        timestamp: Date.now()
    });
    const [isFavorite, setIsFavorite] = useState(() => {
        const userData = loadUserData();
        return !!userData.favoritePapers[paper.title];
    });

    useEffect(() => {
        const userData = loadUserData();
        const paperComment = userData.favoritePapers[paper.title];
        setIsFavorite(!!paperComment);
        if (paperComment) {
            setPaperData(paperComment);
        }
    }, [paper.title]);

    const toggleFavorite = () => {
        const userData = loadUserData();
        if (isFavorite) {
            delete userData.favoritePapers[paper.title];
            setPaperData({
                status: null,
                rating: null,
                comments: '',
                timestamp: Date.now()
            });
        } else {
            userData.favoritePapers[paper.title] = {
                ...paperData,
                timestamp: Date.now()
            };
        }
        saveUserData(userData);
        setIsFavorite(!isFavorite);
    };

    const handleCommentSave = () => {
        const userData = loadUserData();
        userData.favoritePapers[paper.title] = {
            ...paperData,
            timestamp: Date.now()
        };
        saveUserData(userData);
        setCommentDialogOpen(false);
    };

    const handleAuthorClick = (author: string) => {
        const authorIndex = paper.authors.indexOf(author);
        const authorId = paper.authorids[authorIndex];
        
        setSelectedAuthor(author);
        setSelectedAuthorId(authorId);
    };

    const getAuthorPapers = (author: string) => {
        return allPapers.filter(p => {
            const authorIndex = p.authors.indexOf(author);
            return authorIndex !== -1 && p.authorids[authorIndex] === selectedAuthorId;
        });
    };

    return (
        <>
            <Card className="paper-card" sx={{ mb: 2 }}>
                <CardContent sx={{ '& > *': { mb: 1.5 } }}>
                    <div className="paper-header">
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: 'text.primary',
                                fontWeight: 500,
                                mb: 1
                            }}
                        >
                            {paper.title}
                        </Typography>
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
                    </div>

                    <Box sx={{ display: 'flex', gap: 2, ml: 1, mb:2.5 }}>
                        <Tooltip title="View on OpenReview">
                            <Box 
                                component="a" 
                                href={`https://openreview.net/forum?id=${paper.forum}`}
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
                                <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                                OpenReview
                            </Box>
                        </Tooltip>
                        <Tooltip title="View on Cool Papers">
                            <Box 
                                component="a" 
                                href={`https://papers.cool/venue/${paper.forum}@OpenReview`}
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
                                <LaunchIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Cool Papers
                            </Box>
                        </Tooltip>
                    </Box>

                    {isFavorite && paperData.status && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: paperData.status === 'TODO' ? 'warning.main' : 'success.main',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            Status: {paperData.status}
                            {paperData.rating && (
                                <Typography 
                                    component="span" 
                                    sx={{ 
                                        color: 'primary.main',
                                        ml: 1
                                    }}
                                >
                                    • Rating: {paperData.rating}★
                                </Typography>
                            )}
                        </Typography>
                    )}

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',
                            '& .author-link': {
                                color: 'primary.main',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }
                        }}
                    >
                        Authors: {paper.authors.map((author, index) => (
                            <span key={index}>
                                {index > 0 && ', '}
                                <Link
                                    component="button"
                                    onClick={() => handleAuthorClick(author)}
                                    className="author-link"
                                >
                                    {author}
                                </Link>
                            </span>
                        ))}
                    </Typography>
                    
                    <Box sx={{ height: '8px' }} />

                    <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                        <Typography variant="body2">
                            Average Rating: <span style={{ color: '#1976d2', fontWeight: 500 }}>{paper.average_rating.toFixed(2)}</span>
                        </Typography>
                        <Typography variant="body2">
                            Venue: {
                                paper.venue.toLowerCase().includes('oral') ? (
                                    <span style={{ color: '#2e7d32', fontWeight: 500 }}>Oral</span>
                                ) : paper.venue.toLowerCase().includes('spotlight') ? (
                                    <span style={{ color: '#ed6c02', fontWeight: 500 }}>Spotlight</span>
                                ) : (
                                    <span style={{ color: '#0288d1', fontWeight: 500 }}>Poster</span>
                                )
                            }
                        </Typography>
                    </Box>
                    
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',
                        }}
                    >
                        Keywords: {paper.keywords.map((keyword, index) => (
                            <span 
                                key={index} 
                                style={{
                                    color: '#1565c0',
                                    backgroundColor: '#e3f2fd',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginRight: '4px'
                                }}
                            >
                                {keyword}
                            </span>
                        ))}
                    </Typography>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary',  // 改为灰色
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1
                        }}
                    >
                        Primary Area: <span style={{ fontWeight: 500 }}>{paper.primary_area || 'Not specified'}</span>
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton onClick={() => setExpanded(!expanded)}>
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Box>
                    
                    <Collapse in={expanded}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'text.secondary',
                                backgroundColor: 'grey.50',
                                p: 2,
                                borderRadius: 1
                            }}
                        >
                            Abstract: {paper.abstract}
                        </Typography>
                        {isFavorite && paperData.comments && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'primary.main',
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: 'primary.lighter',
                                    borderRadius: 1
                                }}
                            >
                                My Notes: {paperData.comments}
                            </Typography>
                        )}
                    </Collapse>
                </CardContent>
            </Card>

            {selectedAuthor && selectedAuthorId && (
                <AuthorDialog
                    author={selectedAuthor}
                    authorId={selectedAuthorId}
                    papers={getAuthorPapers(selectedAuthor)}
                    open={!!selectedAuthor}
                    onClose={() => {
                        setSelectedAuthor(null);
                        setSelectedAuthorId(null);
                    }}
                />
            )}

            <Dialog 
                open={commentDialogOpen} 
                onClose={() => setCommentDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Paper Notes</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, mt: 1 }}>
                        <Typography gutterBottom>Status:</Typography>
                        <ToggleButtonGroup
                            value={paperData.status}
                            exclusive
                            onChange={(_, value) => setPaperData(prev => ({ ...prev, status: value }))}
                        >
                            <ToggleButton value="TODO">TODO</ToggleButton>
                            <ToggleButton value="Done">Done</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>Your Rating:</Typography>
                        <Rating
                            value={paperData.rating}
                            onChange={(_, value) => setPaperData(prev => ({ ...prev, rating: value }))}
                        />
                    </Box>

                    <TextField
                        label="Comments"
                        multiline
                        rows={4}
                        fullWidth
                        value={paperData.comments}
                        onChange={(e) => setPaperData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCommentSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 