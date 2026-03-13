/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const styles = {
    modalContent: {
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
    },
    modalHeader: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem 2.5rem',
    },
    modalBody: { padding: '1.5rem 2.5rem 2.5rem', lineHeight: '1.7' },

    // Updated for "Album" height matching
    imageContainer: {
        width: '100%',
        aspectRatio: '16 / 9', // Maintains consistent "Album" shape
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '18px',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
    },
    mediaElement: {
        width: '100%',
        height: '100%',
        objectFit: 'contain', // Fills the frame like a photo album
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease'
    },
    galleryContainer: {
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        padding: '5px 5px 15px 5px',
        marginBottom: '1rem',
        justifyContent: 'center',
        scrollbarWidth: 'none',
    },
    galleryItem: {
        flex: '0 0 auto',
        height: '70px', // Slightly taller for better visibility
        aspectRatio: '16 / 9', // Matches the main container's ratio
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '2px solid transparent',
        overflow: 'hidden'
    }
};

const ProjectModal = ({ show, onHide, project, theme }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        if (show) setActiveIdx(0);
    }, [show, project?.title]);

    const allMedia = [project?.cover, ...(project?.images || [])].filter(Boolean);
    const currentMedia = allMedia[activeIdx];

    const isVideo = (path) => path?.match(/\.(mp4|webm|ogg)$/i);

    const handleGalleryClick = (idx) => {
        if (idx === activeIdx) return;
        setIsChanging(true);
        setTimeout(() => {
            setActiveIdx(idx);
            setIsChanging(false);
        }, 150);
    };

    const renderMedia = (src, style) => {
        if (isVideo(src)) {
            return <video src={src} autoPlay muted loop playsInline style={style} />;
        }
        return <img src={src} alt="Project Media" style={style} />;
    };

    if (!project) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <div style={{ ...styles.modalContent, backgroundColor: theme.chronoTheme.cardBgColor, color: theme.color }}>
                <Modal.Header closeButton style={styles.modalHeader} closeVariant={theme.bsPrimaryVariant === 'dark' ? 'white' : undefined}>
                    <Modal.Title style={{ fontWeight: 900, fontSize: '1.8rem' }}>{project.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body style={styles.modalBody} className="custom-scrollbar">
                    {/* Main Stage */}
                    <div style={styles.imageContainer}>
                        {renderMedia(currentMedia, {
                            ...styles.mediaElement,
                            opacity: isChanging ? 0 : 1,
                            transform: isChanging ? 'scale(1.02)' : 'scale(1)'
                        })}
                    </div>

                    {/* Gallery Strip */}
                    {allMedia.length > 1 && (
                        <div style={styles.galleryContainer}>
                            {allMedia.map((src, idx) => {
                                const isActive = activeIdx === idx;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleGalleryClick(idx)}
                                        style={{
                                            ...styles.galleryItem,
                                            opacity: isActive ? 1 : 0.5,
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            borderColor: isActive ? theme.bsSecondaryVariant : 'transparent',
                                            filter: isActive ? 'brightness(1.1)' : 'brightness(0.8)'
                                        }}
                                    >
                                        {renderMedia(src, { width: '100%', height: '100%', objectFit: 'cover' })}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Text Content */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <ReactMarkdown
                            components={{
                                p: ({node, ...props}) => <p style={{ marginBottom: '1.2rem' }} {...props} />,
                                h3: ({node, ...props}) => <h3 style={{ fontWeight: 800, marginTop: '2rem', color: theme.bsSecondaryVariant }} {...props} />,
                            }}
                        >
                            {project.bodyText}
                        </ReactMarkdown>
                    </div>

                    {/* Badges */}
                    {project.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2rem' }}>
                            {project.tags.map((tag) => (
                                <Badge key={tag} pill style={{ padding: '8px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.bsSecondaryVariant}`, color: theme.color }}>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 2.5rem' }}>
                    {project.links?.map((link) => (
                        <Button key={link.href} variant={theme.bsSecondaryVariant} onClick={() => window.open(link.href, '_blank')} style={{ fontWeight: 700, borderRadius: '12px' }}>
                            {link.text}
                        </Button>
                    ))}
                    <Button variant="outline-secondary" onClick={onHide} style={{ borderRadius: '12px' }}>Закрыть</Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default ProjectModal;