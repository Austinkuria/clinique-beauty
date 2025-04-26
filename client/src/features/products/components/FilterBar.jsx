import React, { useContext } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';

// Add categoryLabel prop with a default value
function FilterBar({ categories, onFilterChange, currentFilters, categoryLabel = "Category" }) {
    const { colorValues } = useContext(ThemeContext);

    const handleCategoryChange = (e) => {
        // Update the 'subcategory' field in the filters state
        onFilterChange({ ...currentFilters, subcategory: e.target.value });
    };

    const handleSortChange = (e) => {
        onFilterChange({ ...currentFilters, sort: e.target.value });
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" variant="outlined">
                        {/* Use the categoryLabel prop */}
                        <InputLabel>{categoryLabel}</InputLabel>
                        <Select
                            // Use currentFilters.subcategory
                            value={currentFilters.subcategory}
                            onChange={handleCategoryChange}
                            label={categoryLabel} // Use the categoryLabel prop
                            sx={{
                                color: colorValues.textPrimary, // Ensure text color matches theme
                                '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.textSecondary, // Border color
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.primary, // Hover border color
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.primary, // Focus border color
                                },
                                '.MuiSvgIcon-root': { // Style dropdown icon
                                    color: colorValues.textSecondary,
                                }
                            }}
                            MenuProps={{ // Style the dropdown menu itself
                                PaperProps: {
                                    sx: {
                                        backgroundColor: colorValues.bgPaper,
                                        color: colorValues.textPrimary,
                                    },
                                },
                            }}
                        >
                            {categories.map((category) => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                    sx={{ // Style individual menu items
                                        '&:hover': {
                                            backgroundColor: colorValues.buttonHover,
                                        },
                                        '&.Mui-selected': { // Style selected item
                                            backgroundColor: colorValues.buttonHover,
                                            fontWeight: 500,
                                        },
                                        '&.Mui-selected:hover': { // Style selected item on hover
                                            backgroundColor: colorValues.buttonHover,
                                        }
                                    }}
                                >
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
                                color: colorValues.textPrimary,
                                '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.textSecondary,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.primary,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: colorValues.primary,
                                },
                                '.MuiSvgIcon-root': {
                                    color: colorValues.textSecondary,
                                }
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: colorValues.bgPaper,
                                        color: colorValues.textPrimary,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="default" sx={{ '&:hover': { backgroundColor: colorValues.buttonHover }, '&.Mui-selected': { backgroundColor: colorValues.buttonHover, fontWeight: 500 }, '&.Mui-selected:hover': { backgroundColor: colorValues.buttonHover } }}>Default</MenuItem>
                            <MenuItem value="price-low" sx={{ '&:hover': { backgroundColor: colorValues.buttonHover }, '&.Mui-selected': { backgroundColor: colorValues.buttonHover, fontWeight: 500 }, '&.Mui-selected:hover': { backgroundColor: colorValues.buttonHover } }}>Price: Low to High</MenuItem>
                            <MenuItem value="price-high" sx={{ '&:hover': { backgroundColor: colorValues.buttonHover }, '&.Mui-selected': { backgroundColor: colorValues.buttonHover, fontWeight: 500 }, '&.Mui-selected:hover': { backgroundColor: colorValues.buttonHover } }}>Price: High to Low</MenuItem>
                            <MenuItem value="rating" sx={{ '&:hover': { backgroundColor: colorValues.buttonHover }, '&.Mui-selected': { backgroundColor: colorValues.buttonHover, fontWeight: 500 }, '&.Mui-selected:hover': { backgroundColor: colorValues.buttonHover } }}>Rating</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
}

export default FilterBar;