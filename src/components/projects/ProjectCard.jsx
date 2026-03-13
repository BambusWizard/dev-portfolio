/* eslint-disable */
import React, { useContext, useState, useEffect, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ThemeContext } from 'styled-components';
import ProjectModal from './ProjectModal';

const ProjectCard = ({ project, isGlobalPaused, setGlobalPause }) => {
    const theme = useContext(ThemeContext);
    const [show, setShow] = useState(false);
    const [hover, setHover] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);

    const videoRef = useRef(null);
    const observerRef = useRef(null);
    const cardRef = useRef(null);

    const isVideo = (path) => path?.match(/\.(mp4|webm|ogg)$/i);

    // 1. Lazy Loading Observer: Only load media when near screen
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observerRef.current.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before it enters view
        );

        if (cardRef.current) observerRef.current.observe(cardRef.current);
        return () => observerRef.current?.disconnect();
    }, []);

    // 2. Video Control Logic
    useEffect(() => {
        if (videoRef.current && isVideo(project?.cover)) {
            if (isGlobalPaused) videoRef.current.pause();
            else if (isInView) videoRef.current.play().catch(() => {});
        }
    }, [isGlobalPaused, project?.cover, isInView]);

    const handleOpen = () => {
        setShow(true);
        if (setGlobalPause) setGlobalPause(true);
    };

    const handleClose = () => {
        setShow(false);
        if (setGlobalPause) setGlobalPause(false);
    };

    const renderCardMedia = (src) => {
        const commonStyle = {
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: 12,
            filter: isGlobalPaused ? 'blur(3px) brightness(0.7)' : 'none',
            transition: 'filter 0.3s ease, opacity 0.5s ease',
            opacity: isLoaded ? 1 : 0, // Stay invisible until fully loaded
        };

        if (!isInView) return <div style={{ height: '300px' }} />; // Placeholder height

        if (isVideo(src)) {
            return (
                <video
                    ref={videoRef}
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setIsLoaded(true)}
                    style={commonStyle}
                />
            );
        }

        return (
            <img
                src={src}
                alt={project?.title}
                onLoad={() => setIsLoaded(true)}
                style={commonStyle}
                loading="lazy"
            />
        );
    };

    return (
        <>
            <div ref={cardRef}> {/* Wrapper for Intersection Observer */}
                <Card
                    onClick={handleOpen}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                        borderRadius: 12,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        border: 'none',
                        // Reserve vertical space to prevent Masonry "jumping"
                        minHeight: '200px',
                        backgroundColor: isLoaded ? 'transparent' : '#2a2a2a', // Dark skeleton color
                        transition: 'transform 0.3s ease',
                        transform: hover && !isGlobalPaused ? 'translateY(-5px)' : 'translateY(0)',
                        pointerEvents: isGlobalPaused && !show ? 'none' : 'auto'
                    }}
                >
                    {/* Skeleton loading pulse */}
                    {!isLoaded && (
                        <div className="skeleton-pulse" style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'linear-gradient(90deg, #222 25%, #333 50%, #222 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'loading-shimmer 1.5s infinite'
                        }} />
                    )}

                    {renderCardMedia(project?.cover)}

                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        opacity: hover && !isGlobalPaused && isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease', padding: '20px', borderRadius: 12
                    }}>
                        <Card.Title style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center' }}>
                            {project?.title}
                        </Card.Title>
                        <Button variant="light" size="sm" style={{ fontWeight: 600, borderRadius: '8px' }}>
                            Открыть описание
                        </Button>
                    </div>
                </Card>
            </div>

            <ProjectModal show={show} onHide={handleClose} project={project} theme={theme} />

            <style>{`
                @keyframes loading-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </>
    );
};

export default ProjectCard;