import { useState, useEffect } from 'react';
import { Paper } from '../types';
import { loadPapers, loadUserData } from '../services/dataService';
import PaperCard from './PaperCard';
import AuthorCard from './AuthorCard';
import FilterSection from './FilterSection';
import { 
    Box, Typography, ButtonGroup, Button,
    Pagination
} from '@mui/material';
import PaperDialog from './PaperDialog';

const ITEMS_PER_PAGE = 20;

type DisplayMode = 'papers' | 'authors';

export default function FavoritePapers() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [allPapers, setAllPapers] = useState<Paper[]>([]);
    const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [areas, setAreas] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [displayMode, setDisplayMode] = useState<DisplayMode>('papers');
    
    const [selectedKeyword, setSelectedKeyword] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [authorSearchTerm, setAuthorSearchTerm] = useState<string>('');

    // 用于作者显示的状态
    const [authorPapers, setAuthorPapers] = useState<{ [authorId: string]: { name: string, papers: Paper[] } }>({});

    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

    const [favoriteAuthors, setFavoriteAuthors] = useState<Array<{name: string, id: string}>>([]);

    useEffect(() => {
        const fetchData = async () => {
            const allPapersData = await loadPapers();
            setAllPapers(allPapersData);
            const userData = loadUserData();
            
            // 处理收藏的论文
            const favoritePapers = allPapersData.filter(p => 
                userData.favoritePapers[p.title]
            );
            setPapers(favoritePapers);
            setFilteredPapers(favoritePapers);
            
            // 提取关键词和领域
            const allKeywords = new Set(favoritePapers.flatMap(p => p.keywords));
            const allAreas = new Set(favoritePapers.map(p => p.primary_area));
            setKeywords(Array.from(allKeywords));
            setAreas(Array.from(allAreas));

            // 处理收藏的作者 - 使用作者ID
            const authorMap: { [authorId: string]: { name: string, papers: Paper[] } } = {};
            allPapersData.forEach(paper => {
                paper.authors.forEach((author, index) => {
                    const authorId = paper.authorids[index];
                    if (userData.favoriteAuthors.includes(authorId)) {
                        if (!authorMap[authorId]) {
                            authorMap[authorId] = {
                                name: author,
                                papers: []
                            };
                        }
                        // 避免重复添加同一篇论文
                        if (!authorMap[authorId].papers.some(p => p.title === paper.title)) {
                            authorMap[authorId].papers.push(paper);
                        }
                    }
                });
            });
            setAuthorPapers(authorMap);

            // 需要从 allPapers 中找到对应的作者名字
            const authorInfos = userData.favoriteAuthors.map(authorId => {
                const paper = allPapersData.find(p => p.authorids.includes(authorId));
                const authorIndex = paper ? paper.authorids.indexOf(authorId) : -1;
                return {
                    name: paper ? paper.authors[authorIndex] : authorId,
                    id: authorId
                };
            });
            setFavoriteAuthors(authorInfos);
        };
        fetchData();
    }, [displayMode]);

    useEffect(() => {
        if (displayMode === 'papers') {
            let filtered = [...papers];
            
            if (selectedKeyword) {
                filtered = filtered.filter(p => p.keywords.includes(selectedKeyword));
            }
            if (selectedArea) {
                filtered = filtered.filter(p => p.primary_area === selectedArea);
            }
            if (authorSearchTerm) {
                const searchLower = authorSearchTerm.toLowerCase();
                filtered = filtered.filter(p => 
                    p.authors.some(author => 
                        author.toLowerCase().includes(searchLower)
                    )
                );
            }
            
            filtered.sort((a, b) => b.average_rating - a.average_rating);
            setFilteredPapers(filtered);
        }
        setPage(1);
    }, [selectedKeyword, selectedArea, authorSearchTerm, papers, displayMode]);

    // 获取当前页面要显示的内容
    const getPageContent = () => {
        if (displayMode === 'papers') {
            const pageCount = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
            const displayedPapers = filteredPapers.slice(
                (page - 1) * ITEMS_PER_PAGE,
                page * ITEMS_PER_PAGE
            );

            return {
                items: displayedPapers,
                total: filteredPapers.length,
                pageCount
            };
        } else {
            const favoriteAuthors = Object.entries(authorPapers);
            const pageCount = Math.ceil(favoriteAuthors.length / ITEMS_PER_PAGE);
            const displayedAuthors = favoriteAuthors.slice(
                (page - 1) * ITEMS_PER_PAGE,
                page * ITEMS_PER_PAGE
            );

            return {
                items: displayedAuthors,
                total: favoriteAuthors.length,
                pageCount
            };
        }
    };

    const pageContent = getPageContent();

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <ButtonGroup 
                variant="outlined" 
                sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}
            >
                <Button 
                    variant={displayMode === 'papers' ? "contained" : "outlined"}
                    onClick={() => setDisplayMode('papers')}
                >
                    Favorite Papers
                </Button>
                <Button 
                    variant={displayMode === 'authors' ? "contained" : "outlined"}
                    onClick={() => setDisplayMode('authors')}
                >
                    Favorite Authors
                </Button>
            </ButtonGroup>

            {displayMode === 'papers' && (
                <FilterSection
                    keywords={keywords}
                    areas={areas}
                    selectedKeyword={selectedKeyword}
                    selectedArea={selectedArea}
                    authorSearchTerm={authorSearchTerm}
                    onKeywordChange={setSelectedKeyword}
                    onAreaChange={setSelectedArea}
                    onAuthorSearchChange={setAuthorSearchTerm}
                />
            )}

            <Typography variant="body2" sx={{ mb: 2 }}>
                Showing {pageContent.items.length} of {pageContent.total} {displayMode}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                {displayMode === 'papers' ? (
                    pageContent.items.map((paper, index) => (
                        <PaperCard key={index} paper={paper} allPapers={allPapers} />
                    ))
                ) : (
                    pageContent.items.map(([authorId, authorData]) => (
                        <AuthorCard 
                            key={authorId} 
                            author={authorData.name} 
                            authorId={authorId}
                            papers={authorData.papers}
                            onPaperClick={setSelectedPaper}
                        />
                    ))
                )}
            </Box>

            {pageContent.pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                    <Pagination 
                        count={pageContent.pageCount} 
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {selectedPaper && (
                <PaperDialog
                    paper={selectedPaper}
                    open={!!selectedPaper}
                    onClose={() => setSelectedPaper(null)}
                    onAuthorClick={(author) => {
                        setSelectedPaper(null);
                        // 如果需要处理作者点击，可以在这里添加逻辑
                    }}
                />
            )}
        </Box>
    );
} 