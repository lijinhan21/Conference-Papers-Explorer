import { useState, useEffect } from 'react';
import { Paper } from '../types';
import { loadPapers } from '../services/dataService';
import PaperCard from './PaperCard';
import FilterSection from './FilterSection';

export default function PaperList() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [areas, setAreas] = useState<string[]>([]);
    const [authors, setAuthors] = useState<string[]>([]);
    
    const [selectedKeyword, setSelectedKeyword] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [selectedAuthor, setSelectedAuthor] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const data = await loadPapers();
            setPapers(data);
            setFilteredPapers(data);
            
            // Extract unique keywords, areas, and authors
            const allKeywords = new Set(data.flatMap(p => p.keywords));
            const allAreas = new Set(data.map(p => p.primary_area));
            const allAuthors = new Set(data.flatMap(p => p.authors));
            
            setKeywords(Array.from(allKeywords));
            setAreas(Array.from(allAreas));
            setAuthors(Array.from(allAuthors));
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
        if (selectedAuthor) {
            filtered = filtered.filter(p => p.authors.includes(selectedAuthor));
        }
        
        // Sort by average rating
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        
        setFilteredPapers(filtered);
    }, [selectedKeyword, selectedArea, selectedAuthor, papers]);

    return (
        <div className="paper-list">
            <FilterSection
                keywords={keywords}
                areas={areas}
                authors={authors}
                selectedKeyword={selectedKeyword}
                selectedArea={selectedArea}
                selectedAuthor={selectedAuthor}
                onKeywordChange={setSelectedKeyword}
                onAreaChange={setSelectedArea}
                onAuthorChange={setSelectedAuthor}
            />
            <div className="papers-grid">
                {filteredPapers.map((paper, index) => (
                    <PaperCard key={index} paper={paper} />
                ))}
            </div>
        </div>
    );
} 