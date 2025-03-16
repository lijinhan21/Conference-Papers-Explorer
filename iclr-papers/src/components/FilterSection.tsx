import { FormControl, InputLabel, Select, MenuItem, TextField, Box } from '@mui/material';

interface FilterSectionProps {
    keywords: string[];
    areas: string[];
    selectedKeyword: string;
    selectedArea: string;
    authorSearchTerm: string;
    onKeywordChange: (keyword: string) => void;
    onAreaChange: (area: string) => void;
    onAuthorSearchChange: (search: string) => void;
}

export default function FilterSection({
    keywords,
    areas,
    selectedKeyword,
    selectedArea,
    authorSearchTerm,
    onKeywordChange,
    onAreaChange,
    onAuthorSearchChange
}: FilterSectionProps) {
    return (
        <Box className="filter-section">
            <FormControl fullWidth>
                <InputLabel>Keyword</InputLabel>
                <Select
                    value={selectedKeyword}
                    onChange={(e) => onKeywordChange(e.target.value as string)}
                >
                    <MenuItem value="">All</MenuItem>
                    {keywords.map(keyword => (
                        <MenuItem key={keyword} value={keyword}>{keyword}</MenuItem>
                    ))}
                </Select>
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
} 