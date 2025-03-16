import { Paper, PaperComment } from '../types';
import { loadUserData, saveUserData } from '../services/dataService';
import { 
    Dialog, DialogTitle, DialogContent, 
    Typography, IconButton, Box,
    Link, Collapse
} from '@mui/material';
import { 
    Favorite, FavoriteBorder,
    ExpandMore, ExpandLess 
} from '@mui/icons-material';
import { useState } from 'react';

interface PaperDialogProps {
    paper: Paper;
    open: boolean;
    onClose: () => void;
    onAuthorClick: (author: string, papers: Paper[]) => void;
}

export default function PaperDialog({ paper, open, onClose, onAuthorClick }: PaperDialogProps) {
    const [expanded, setExpanded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(() => {
        const userData = loadUserData();
        return !!userData.favoritePapers[paper.title];
    });

    const toggleFavorite = () => {
        const userData = loadUserData();
        if (isFavorite) {
            delete userData.favoritePapers[paper.title];
        } else {
            userData.favoritePapers[paper.title] = {
                status: null,
                rating: null,
                comments: '',
                timestamp: Date.now()
            };
        }
        saveUserData(userData);
        setIsFavorite(!isFavorite);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {paper.title}
                    <IconButton onClick={toggleFavorite}>
                        {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Authors: {paper.authors.map((author, index) => (
                        <span key={index}>
                            {index > 0 && ', '}
                            <Link
                                component="button"
                                onClick={() => onAuthorClick(author, [])}
                                sx={{ cursor: 'pointer' }}
                            >
                                {author}
                            </Link>
                        </span>
                    ))}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', my: 1 }}>
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

                <Typography variant="body2" sx={{ mb: 1 }}>
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
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                    }}
                >
                    Primary Area: <span style={{ fontWeight: 500 }}>{paper.primary_area || 'Not specified'}</span>
                </Typography>

                <Box sx={{ mt: 1 }}>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Collapse in={expanded}>
                        <Typography 
                            variant="body2"
                            sx={{
                                backgroundColor: 'grey.50',
                                p: 2,
                                borderRadius: 1
                            }}
                        >
                            Abstract: {paper.abstract}
                        </Typography>
                    </Collapse>
                </Box>
            </DialogContent>
        </Dialog>
    );
} 