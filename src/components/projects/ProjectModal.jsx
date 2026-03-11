/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

const styles = {
    modalContent: { borderRadius: '16px', border: 'none', overflow: 'hidden' },
    modalHeader: { borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 2rem' },
    modalBody: { padding: '2rem', lineHeight: '1.6' },
    imageContainer: {
        width: '100%',
        height: '400px',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
    },
    mediaElement: { width: '100%', height: '100%', objectFit: 'contain' },
    galleryContainer: {
        display: 'flex',
        overflowX: 'auto',
        gap: '10px',
        paddingBottom: '15px',
        marginBottom: '1.5rem',
        justifyContent: 'center',
    },
    galleryItem: {
        flex: '0 0 auto',
        height: '70px',
        borderRadius: '8px',
        objectFit: 'cover',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
    }
};

const ProjectModal = ({ show, onHide, project, theme }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (show) setActiveIdx(0);
    }, [show, project?.title]);

    const allMedia = project?.images ? [project.image, ...project.images] : [project.image];
    const currentMedia = allMedia[activeIdx];

    const isVideo = (path) => path?.match(/\.(mp4|webm|ogg)$/i);

    // This function must exist inside the component for the JSX below to find it
    const renderMedia = (src, style) => {
        if (isVideo(src)) {
            return (
                <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={style}
                />
            );
        }
        return <img src={src} alt="Project Media" style={style} />;
    };

    if (!project) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            restoreFocus={false}
            enforceFocus={false}
            autoFocus={false}
        >
            <div
                style={{
                    ...styles.modalContent,
                    backgroundColor: theme.chronoTheme.cardBgColor,
                    color: theme.color,
                }}
            >
                <Modal.Header
                    closeButton
                    style={styles.modalHeader}
                    closeVariant={theme.bsPrimaryVariant === 'dark' ? 'white' : undefined}
                >
                    <Modal.Title style={{ fontWeight: 800 }}>{project.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body style={styles.modalBody}>
                    <div style={styles.imageContainer}>
                        {/* renderMedia is called here */}
                        {renderMedia(currentMedia, styles.mediaElement)}
                    </div>

                    {allMedia.length > 1 && (
                        <div style={styles.galleryContainer}>
                            {allMedia.map((src, idx) => {
                                const isActive = activeIdx === idx;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveIdx(idx)}
                                        style={{
                                            ...styles.galleryItem,
                                            width: isActive ? '100px' : '60px',
                                            opacity: isActive ? 1 : 0.5,
                                            border: isActive ? `2px solid ${theme.bsSecondaryVariant}` : 'none',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* renderMedia is called here for thumbnails */}
                                        {renderMedia(src, { width: '100%', height: '100%', objectFit: 'cover' })}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                        <ReactMarkdown>{project.bodyText}</ReactMarkdown>
                    </div>

                    {project.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1.5rem' }}>
                            {project.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    pill
                                    bg={theme.bsSecondaryVariant}
                                    text={theme.bsPrimaryVariant}
                                    style={{ padding: '8px 14px' }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {project.links?.map((link) => (
                        <Button
                            key={link.href}
                            variant={theme.bsSecondaryVariant}
                            onClick={() => window.open(link.href, '_blank')}
                            style={{ fontWeight: 600 }}
                        >
                            {link.text}
                        </Button>
                    ))}
                    <Button variant="outline-secondary" onClick={onHide}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default ProjectModal;