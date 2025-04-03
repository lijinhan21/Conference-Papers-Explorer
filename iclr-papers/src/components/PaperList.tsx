import { useState, useEffect } from 'react';
import { Paper } from '../types';
import { loadPapers } from '../services/dataService';
import PaperCard from './PaperCard';
import FilterSection from './FilterSection';
import { 
    Button, Pagination, Box, TextField, FormControl, 
    InputLabel, Select, MenuItem, Autocomplete 
} from '@mui/material';

const ITEMS_PER_PAGE = 20;  // 每页显示20篇论文

// Create a simplified version of FilterSection specifically for PaperList
interface SimplifiedFilterSectionProps {
    keywords: string[];
    areas: string[];
    selectedKeyword: string;
    selectedArea: string;
    authorSearchTerm: string;
    onKeywordChange: (keyword: string) => void;
    onAreaChange: (area: string) => void;
    onAuthorSearchChange: (search: string) => void;
}

const SimplifiedFilterSection = ({ 
    keywords, 
    areas, 
    selectedKeyword, 
    selectedArea, 
    authorSearchTerm,
    onKeywordChange,
    onAreaChange,
    onAuthorSearchChange
}: SimplifiedFilterSectionProps) => {
    return (
        <Box className="filter-section" sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
                <Autocomplete
                    value={selectedKeyword}
                    onChange={(_, newValue) => onKeywordChange(newValue || "")}
                    options={keywords.slice(0, 100)}
                    renderInput={(params) => <TextField {...params} label="Keyword" />}
                    freeSolo
                />
            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Primary Area</InputLabel>
                <Select
                    value={selectedArea}
                    onChange={(e) => onAreaChange(e.target.value as string)}
                >
                    <MenuItem value="">All</MenuItem>
                    {areas.map(area => (
                        <MenuItem key={area} value={area}>{area}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Search Author"
                value={authorSearchTerm}
                onChange={(e) => onAuthorSearchChange(e.target.value)}
                placeholder="Type author name..."
            />
        </Box>
    );
};

export default function PaperList() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [areas, setAreas] = useState<string[]>([]);
    
    const [selectedKeyword, setSelectedKeyword] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [authorSearchTerm, setAuthorSearchTerm] = useState<string>('');
    const [page, setPage] = useState(1);  // 页码从1开始

    useEffect(() => {
        const fetchData = async () => {
            const data = await loadPapers();
            setPapers(data);
            setFilteredPapers(data);
            
            // Extract unique keywords and areas
            const allKeywords = new Set(data.flatMap(p => p.keywords).filter(k => k !== undefined));
            const allAreas = new Set(data.map(p => p.primary_area).filter(a => a !== undefined));
            
            setKeywords(Array.from(allKeywords) as string[]);
            setAreas(Array.from(allAreas) as string[]);
        };
        fetchData();
    }, []);

    useEffect(() => {
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
                    typeof author === 'string' ? author.toLowerCase().includes(searchLower) : author.name.toLowerCase().includes(searchLower)
                )
            );
        }
        
        // Sort by average rating
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        
        setFilteredPapers(filtered);
        setPage(1);  // 重置到第一页
    }, [selectedKeyword, selectedArea, authorSearchTerm, papers]);

    const pageCount = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
    const displayedPapers = filteredPapers.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <div className="paper-list">
            <SimplifiedFilterSection
                keywords={keywords}
                areas={areas}
                selectedKeyword={selectedKeyword}
                selectedArea={selectedArea}
                authorSearchTerm={authorSearchTerm}
                onKeywordChange={setSelectedKeyword}
                onAreaChange={setSelectedArea}
                onAuthorSearchChange={setAuthorSearchTerm}
            />
            
            <Box sx={{ mb: 2 }}>
                Showing {displayedPapers.length} of {filteredPapers.length} papers
            </Box>

            <div className="papers-grid">
                {displayedPapers.map((paper, index) => (
                    <PaperCard 
                        key={index} 
                        paper={paper} 
                        allPapers={papers}
                    />
                ))}
            </div>

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
        </div>
    );
} 