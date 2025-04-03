import { FormControl, InputLabel, Select, MenuItem, TextField, Box, Autocomplete, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useState, useMemo } from 'react';

interface FilterSectionProps {
    keywords: string[];
    areas: string[];
    selectedKeyword: string;
    selectedArea: string;
    authorSearchTerm: string;
    selectedStatus?: 'all' | 'TODO' | 'Done';
    selectedRating?: number | null;
    onKeywordChange: (keyword: string) => void;
    onAreaChange: (area: string) => void;
    onAuthorSearchChange: (search: string) => void;
    onStatusChange?: (status: 'all' | 'TODO' | 'Done') => void;
    onRatingChange?: (rating: number | null) => void;
}

export default function FilterSection({
    keywords,
    areas,
    selectedKeyword,
    selectedArea,
    authorSearchTerm,
    selectedStatus = 'all',
    selectedRating = null,
    onKeywordChange,
    onAreaChange,
    onAuthorSearchChange,
    onStatusChange = () => {},
    onRatingChange = () => {}
}: FilterSectionProps) {
    // 添加本地搜索状态
    const [inputValue, setInputValue] = useState('');
    
    // 根据输入过滤关键词
    const filteredOptions = useMemo(() => {
        if (!inputValue) {
            // 当没有输入时，只显示前100个选项
            return keywords.slice(0, 100);
        }
        
        const searchTerm = inputValue.toLowerCase();
        return keywords
            .filter(keyword => keyword.toLowerCase().includes(searchTerm))
            .slice(0, 100); // 最多显示100个匹配结果
    }, [keywords, inputValue]);

    // Check if status and rating props are provided
    const showStatusFilter = onStatusChange !== (() => {});
    const showRatingFilter = onRatingChange !== (() => {});

    return (
        <Box className="filter-section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                    <Autocomplete
                        value={selectedKeyword}
                        onChange={(_, newValue) => onKeywordChange(newValue || "")}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                        options={filteredOptions}
                        renderInput={(params) => <TextField {...params} label="Keyword" />}
                        filterOptions={(options, params) => {
                            // 直接使用已经过滤的选项，避免重复过滤
                            return options;
                        }}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        disableListWrap
                        loading={keywords.length > 1000}
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

            {(showStatusFilter || showRatingFilter) && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {showStatusFilter && (
                        <ToggleButtonGroup
                            value={selectedStatus}
                            exclusive
                            onChange={(_, newStatus) => {
                                if (newStatus !== null && onStatusChange) {
                                    onStatusChange(newStatus);
                                }
                            }}
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="TODO">TODO</ToggleButton>
                            <ToggleButton value="Done">Done</ToggleButton>
                        </ToggleButtonGroup>
                    )}

                    {showRatingFilter && (
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Rating</InputLabel>
                            <Select
                                value={selectedRating || ''}
                                onChange={(e) => onRatingChange && onRatingChange(e.target.value as number || null)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <MenuItem key={rating} value={rating}>
                                        {rating} {rating === 1 ? 'Star' : 'Stars'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>
            )}
        </Box>
    );
} 