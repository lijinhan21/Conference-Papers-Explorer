import { Paper } from '../types';
import { Dialog, DialogTitle, DialogContent, Box, Link, Tooltip } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import AuthorCard from './AuthorCard';

interface AuthorDialogProps {
    author: string;
    authorId: string;
    papers: Paper[];
    open: boolean;
    onClose: () => void;
    onPaperClick?: (paper: Paper) => void;
}

export default function AuthorDialog({ author, authorId, papers, open, onClose, onPaperClick }: AuthorDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ p: 0 }}>
                <AuthorCard 
                    author={author} 
                    authorId={authorId}
                    papers={papers}
                    onPaperClick={onPaperClick}
                />
            </DialogTitle>
        </Dialog>
    );
}