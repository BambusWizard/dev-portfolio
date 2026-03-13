/* eslint-disable */
import React, { useContext, useState, useEffect, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ThemeContext } from 'styled-components';
import ProjectModal from './ProjectModal'; // Ensure this path is correct!

const ProjectCard = ({ project, isGlobalPaused, setGlobalPause }) => {
    const theme = useContext(ThemeContext);
    const [show, setShow] = useState(false);
    const [hover, setHover] = useState(false);
    const videoRef = useRef(null);

    const isVideo = (path) => path?.match(/\.(mp4|webm|ogg)$/i);

    useEffect(() => {
        if (videoRef.current && isVideo(project?.cover)) {
            if (isGlobalPaused) videoRef.current.pause();
            else videoRef.current.play().catch(() => {});
        }
    }, [isGlobalPaused, project?.cover]);

    const handleOpen = () => {
        setShow(true);
        if (setGlobalPause) setGlobalPause(true);
    };

    const handleClose = () => {
        setShow(false);
        if (setGlobalPause) setGlobalPause(false);
    };

    const renderCardMedia = (src) => {
        const style = {
            width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 12,
            filter: isGlobalPaused ? 'blur(3px) brightness(0.7)' : 'none',
            transition: 'filter 0.3s ease'
        };
        if (isVideo(src)) {
            return <video ref={videoRef} src={src} autoPlay loop muted playsInline style={style} />;
        }
        return <img src={src} alt={project?.title} style={style} />;
    };

    return (
        <>
            <Card
                onClick={handleOpen}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    borderRadius: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    border: 'none', backgroundColor: 'transparent', transition: 'transform 0.3s ease',
                    transform: hover && !isGlobalPaused ? 'translateY(-5px)' : 'translateY(0)',
                    pointerEvents: isGlobalPaused && !show ? 'none' : 'auto'
                }}
            >
                {renderCardMedia(project?.cover)}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: hover && !isGlobalPaused ? 1 : 0, transition: 'opacity 0.3s ease', padding: '20px', borderRadius: 12 }}>
                    <Card.Title style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{project?.title}</Card.Title>
                    <Button variant="light" size="sm" style={{ fontWeight: 600, borderRadius: '8px' }}>Открыть описание</Button>
                </div>
            </Card>

            <ProjectModal show={show} onHide={handleClose} project={project} theme={theme} />
        </>
    );
};

export default ProjectCard;