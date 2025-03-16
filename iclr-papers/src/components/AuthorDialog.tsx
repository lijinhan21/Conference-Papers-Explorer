import { Paper } from '../types';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import AuthorCard from './AuthorCard';

interface AuthorDialogProps {
    author: string;
    papers: Paper[];
    open: boolean;
    onClose: () => void;
    onPaperClick?: (paper: Paper) => void;
}

export default function AuthorDialog({ author, papers, open, onClose, onPaperClick }: AuthorDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ p: 0 }}>
                <AuthorCard 
                    author={author} 
                    papers={papers}
                    onPaperClick={onPaperClick}
                />
            </DialogTitle>
        </Dialog>
    );
}