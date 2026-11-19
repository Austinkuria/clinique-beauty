// client/src/features/home/components/HotCategories.jsx
// Full-width visual category hub with theme-aligned palette

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Avatar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';

export default function HotCategories({ categories = [] }) {
    const { colorValues } = useTheme();

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 2.5, backgroundColor: colorValues.bgDefault }}>
            <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, md: 2.5 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mb: 3, color: colorValues.textPrimary }}>
                        Hot Categories
                    </Typography>

                    <Grid container spacing={2} justifyContent="flex-start">
                        {categories.map((cat) => (
                            <Grid item key={cat.id} xs={4} sm={3} md={2.4} lg={1.2}>
                                <Box
                                    component={RouterLink}
                                    to={`/products/${cat.slug || cat.name.toLowerCase()}`}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        p: 1.5,
                                        borderRadius: 2,
                                        transition: 'background-color 0.2s, transform 0.2s',
                                        '&:hover': {
                                            backgroundColor: colorValues.buttonHover,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Avatar
                                        src={cat.image}
                                        alt={cat.name}
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            mb: 1.2,
                                            border: '2px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 600,
                                            color: colorValues.textPrimary,
                                            textAlign: 'center',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {cat.name}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
