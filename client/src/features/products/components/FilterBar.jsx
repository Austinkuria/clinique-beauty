import React, { useContext } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';

function FilterBar({ categories, onFilterChange, currentFilters }) {
    const { colorValues } = useContext(ThemeContext);

    const handleCategoryChange = (e) => {
        onFilterChange({ ...currentFilters, category: e.target.value });
    };

    const handleSortChange = (e) => {
        onFilterChange({ ...currentFilters, sort: e.target.value });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={currentFilters.category}
                            onChange={handleCategoryChange}
                            label="Category"
                            sx={{
                                '&:focus': {
                                    borderColor: colorValues.primary,
                                }
                            }}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={currentFilters.sort}
                            onChange={handleSortChange}
                            label="Sort By"
                            sx={{
                                '&:focus': {
                                    borderColor: colorValues.primary,
                                }
                            }}
                        >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="price-low">Price: Low to High</MenuItem>
                            <MenuItem value="price-high">Price: High to Low</MenuItem>
                            <MenuItem value="rating">Rating</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
}

export default FilterBar;