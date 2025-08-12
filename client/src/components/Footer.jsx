import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import {
    Box,
    Typography,
    IconButton,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
    TextField,
    Button
} from '@mui/material';
import {
    Instagram,
    Facebook,
    Twitter,
    Pinterest,
    Email,
    Phone,
    LocationOn,
    Send
} from '@mui/icons-material';

function Footer() {
    const { colors } = useContext(ThemeContext);
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            className={`${colors?.footerBg} border-t ${colors?.footerBorder}`}
            sx={{
                py: 4,
                color: colors?.footerText,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Section */}
                    <Grid item xs={12} md={3}>
                        <Typography
                            variant="h6"
                            component="h3"
                            gutterBottom
                            className={`${colors?.footerHeading}`}
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            Clinique Beauty
                        </Typography>
                        <Typography variant="body2" paragraph className={`${colors?.footerText}`}>
                            Premium skincare and beauty products crafted with care for all skin types.
                        </Typography>
                        <Box>
                            <IconButton color="inherit" aria-label="instagram" href="https://instagram.com" className={`${colors?.footerSocial}`}>
                                <Instagram />
                            </IconButton>
                            <IconButton color="inherit" aria-label="facebook" href="https://facebook.com" className={`${colors?.footerSocial}`}>
                                <Facebook />
                            </IconButton>
                            <IconButton color="inherit" aria-label="twitter" href="https://twitter.com" className={`${colors?.footerSocial}`}>
                                <Twitter />
                            </IconButton>
                            <IconButton color="inherit" aria-label="pinterest" href="https://pinterest.com" className={`${colors?.footerSocial}`}>
                                <Pinterest />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={6} md={3}>
                        <Typography
                            variant="h6"
                            component="h4"
                            gutterBottom
                            className={`${colors?.footerHeading}`}
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            Quick Links
                        </Typography>
                        <List>
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Products', path: '/products' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                { name: 'Privacy Policy', path: '/privacy' }
                            ].map((link) => (
                                <ListItem key={link.name} disablePadding>
                                    <Button
                                        component={RouterLink}
                                        to={link.path}
                                        color="inherit"
                                        className={`${colors?.footerLink} hover:${colors?.footerLinkHover} transition-colors duration-200`}
                                        sx={{
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {link.name}
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={6} md={3}>
                        <Typography
                            variant="h6"
                            component="h4"
                            gutterBottom
                            className={`${colors?.footerHeading}`}
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            Contact Us
                        </Typography>
                        <List>
                            <ListItem disablePadding className={`${colors?.footerText}`}>
                                <LocationOn sx={{ mr: 1 }} />
                                <ListItemText primary="123 Beauty Lane, Skincare City, SC 12345" />
                            </ListItem>
                            <ListItem disablePadding className={`${colors?.footerText}`}>
                                <Phone sx={{ mr: 1 }} />
                                <ListItemText primary="(+254) 797561978" />
                            </ListItem>
                            <ListItem disablePadding className={`${colors?.footerText}`}>
                                <Email sx={{ mr: 1 }} />
                                <ListItemText primary="hello@cliniquebeauty.com" />
                            </ListItem>
                        </List>
                    </Grid>

                    {/* Newsletter Signup */}
                    <Grid item xs={12} md={3}>
                        <Typography
                            variant="h6"
                            component="h4"
                            gutterBottom
                            className={`${colors?.footerHeading}`}
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            Stay Updated
                        </Typography>
                        <Typography variant="body2" paragraph className={`${colors?.footerText}`}>
                            Subscribe to our newsletter for exclusive offers and skincare tips.
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                            <TextField
                                variant="outlined"
                                placeholder="Your email"
                                size="small"
                                className={`${colors?.footerInput} bg-white`}
                                sx={{
                                    mr: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: colors?.footerInput,
                                        },
                                        '&:hover fieldset': {
                                            borderColor: colors?.accent,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: colors?.accent,
                                        },
                                    },
                                    input: {
                                        color: colors?.footerText,
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<Send />}
                                className={`${colors?.footerButton} hover:bg-pink-700`}
                            >
                                Subscribe
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Copyright Bar */}
                <Box mt={4} py={2} className={`border-t ${colors?.footerBorder} text-center`}>
                    <Typography variant="body2" className={`${colors?.footerText}`}>
                        © {currentYear} Clinique Beauty. All rights reserved.
                    </Typography>
                    <Box mt={2}>
                        <Button component={RouterLink} to="/terms" color="inherit" className={`${colors?.footerLink} hover:${colors?.footerLinkHover} mr-2`}>
                            Terms of Service
                        </Button>
                        <Button component={RouterLink} to="/privacy" color="inherit" className={`${colors?.footerLink} hover:${colors?.footerLinkHover}`}>
                            Privacy Policy
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default Footer;
