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
    modalBody: {
        padding: '1.5rem 2.5rem 2.5rem',
        lineHeight: '1.7',
        maxHeight: '80vh', // Prevent modal from going off-screen
        overflowY: 'auto'
    },
    imageContainer: {
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '18px',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    mediaElement: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transition: 'opacity 0.2s ease-in-out'
    },
    galleryContainer: {
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        padding: '10px 0',
        marginBottom: '1.5rem',
        justifyContent: 'center', // Centered like iOS
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch', // Smooth momentum scrolling for mobile
    },
    galleryItem: {
        flex: '0 0 70px', // Slightly smaller, more refined
        height: '70px',
        borderRadius: '8px', // Extra rounded iOS look
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth iOS-like curve
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.2)',
        outline: 'none', // Removes the blue/black focus ring
        border: 'none',  // Removes the border you asked to take out
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent', // Removes the gray flash on mobile tap
    },
    thumbMedia: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none', // Prevents interaction with the video tag itself
    }
};

const ProjectModal = ({ show, onHide, project, theme }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [isChanging, setIsChanging] = useState(false);

    // Reset index when modal opens or project changes
    useEffect(() => {
        if (show) {
            setActiveIdx(0);
            setIsChanging(false);
        }
    }, [show, project?.title]);

    if (!project) return null;

    const allMedia = [project?.cover, ...(project?.images || [])].filter(Boolean);
    const currentMedia = allMedia[activeIdx];

    const isVideo = (path) => path?.match(/\.(mp4|webm|ogg)$/i);

    const handleGalleryClick = (idx) => {
        if (idx === activeIdx) return;
        setIsChanging(true);
        // Short delay for the fade-out effect
        setTimeout(() => {
            setActiveIdx(idx);
            setIsChanging(false);
        }, 120);
    };

    // Helper for main display
    const renderMainMedia = (src) => {
        const mediaStyle = {
            ...styles.mediaElement,
            opacity: isChanging ? 0 : 1,
        };

        if (isVideo(src)) {
            return <video key={src} src={src} autoPlay muted loop playsInline style={mediaStyle} />;
        }
        return <img key={src} src={src} alt="Project Media" style={mediaStyle} />;
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <div style={{ ...styles.modalContent, backgroundColor: theme.chronoTheme.cardBgColor, color: theme.color }}>
                <Modal.Header closeButton style={styles.modalHeader} closeVariant={theme.bsPrimaryVariant === 'dark' ? 'white' : undefined}>
                    <Modal.Title style={{ fontWeight: 900, fontSize: '1.8rem' }}>{project.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body style={styles.modalBody} className="custom-scrollbar">
                    {/* Main Display */}
                    <div style={styles.imageContainer}>
                        {renderMainMedia(currentMedia)}
                    </div>

                    {/* Gallery Strip */}
                    {allMedia.length > 1 && (
                        <div style={styles.galleryContainer} className="no-scrollbar">
                            {allMedia.map((src, idx) => {
                                const isActive = activeIdx === idx;
                                const isMediaVideo = isVideo(src);

                                return (
                                    <div
                                        key={`${project.title}-thumb-${idx}`}
                                        onClick={() => handleGalleryClick(idx)}
                                        role="button"
                                        tabIndex={0}
                                        style={{
                                            ...styles.galleryItem,
                                            opacity: isActive ? 1 : 0.4,
                                            transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                            // Using a soft shadow instead of an outline
                                            boxShadow: isActive ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
                                        }}
                                    >
                                        {isMediaVideo ? (
                                            <video
                                                src={src}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                style={styles.thumbMedia}
                                            />
                                        ) : (
                                            <img
                                                src={src}
                                                alt="thumb"
                                                style={styles.thumbMedia}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

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