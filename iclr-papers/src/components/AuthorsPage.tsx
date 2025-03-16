import { useState, useEffect } from 'react';
import { Paper } from '../types';
import { loadPapers } from '../services/dataService';
import AuthorCard from './AuthorCard';
import { Box, TextField, Typography, Pagination } from '@mui/material';
import PaperDialog from './PaperDialog';

type AuthorPapers = {
    [authorId: string]: {
        name: string;
        papers: Paper[];
    };
};

const ITEMS_PER_PAGE = 20;

export default function AuthorsPage() {
    const [authorPapers, setAuthorPapers] = useState<AuthorPapers>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const papers = await loadPapers();
            const authorMap: AuthorPapers = {};
            
            papers.forEach(paper => {
                paper.authors.forEach((author, index) => {
                    const authorId = paper.authorids[index];
                    if (!authorMap[authorId]) {
                        authorMap[authorId] = {
                            name: author,
                            papers: []
                        };
                    }
                    authorMap[authorId].papers.push(paper);
                });
            });
            
            setAuthorPapers(authorMap);
        };
        
        fetchData();
    }, []);

    const filteredAuthors = Object.entries(authorPapers)
        .filter(([authorId, authorData]) => 
            authorData.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort(([, authorDataA], [, authorDataB]) => 
            authorDataA.name.localeCompare(authorDataB.name)
        );

    const pageCount = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
    const displayedAuthors = filteredAuthors.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <TextField
                label="Search Authors"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                }}
                fullWidth
                sx={{ mb: 3 }}
            />

            <Typography variant="body2" sx={{ mb: 2 }}>
                Showing {displayedAuthors.length} of {filteredAuthors.length} authors
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {displayedAuthors.map(([authorId, authorData]) => (
                    <AuthorCard 
                        key={authorId} 
                        author={authorData.name}
                        authorId={authorId}
                        papers={authorData.papers}
                        onPaperClick={setSelectedPaper}
                    />
                ))}
            </Box>

            {selectedPaper && (
                <PaperDialog
                    paper={selectedPaper}
                    open={!!selectedPaper}
                    onClose={() => setSelectedPaper(null)}
                />
            )}

            {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                    <Pagination 
                        count={pageCount} 
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
} 