/* eslint-disable */
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { ThemeContext } from 'styled-components';
import Fade from 'react-reveal/Fade';
import endpoints from '../constants/endpoints';
import ProjectCard from './projects/ProjectCard';
import FallbackSpinner from './FallbackSpinner';
import yaml from 'js-yaml';

const Projects = (props) => {
  const theme = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);

  const [activeSection, setActiveSection] = useState('Проекты');
  const [filter, setFilter] = useState('Все');
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // 1. Optimized Resize: Use a debounce to prevent 100s of re-renders per second
  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 150); // Only update width every 150ms
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(endpoints.projects).then((res) => res.text()),
      fetch(endpoints.others).then((res) => res.text()),
    ])
        .then(([projectsText, othersText]) => {
          const projectsDoc = yaml.load(projectsText);
          const othersDoc = yaml.load(othersText);

          setData({
            projects: projectsDoc.projects || [],
            others: othersDoc.projects || [],
          });
        })
        .catch((err) => console.error('YAML Loading Error:', err));
  }, []);

  const sections = useMemo(() => {
    if (!data) return { projects: [], others: [] };
    const getCats = (items) => Array.from(new Set(items.map((p) => p.category).filter(Boolean))).sort();
    return {
      projects: ['Все', ...getCats(data.projects)],
      others: ['Все', ...getCats(data.others)],
    };
  }, [data]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setFilter('Все');
  };

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const source = activeSection === 'Проекты' ? data.projects : data.others;
    return filter === 'Все' ? source : source.filter((p) => p.category === filter);
  }, [data, activeSection, filter]);

  // 2. Masonry logic with safety checks
  const CARD_MAX_WIDTH = 320;
  const GAP = 25;
  const MAX_COLS = 4;
  const colCount = Math.max(1, Math.min(MAX_COLS, Math.floor(width / (CARD_MAX_WIDTH + GAP))));

  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    filteredItems.forEach((item, index) => {
      cols[index % colCount].push(item);
    });
    return cols;
  }, [filteredItems, colCount]);

  return (
      <>
        {data ? (
            <div className="section-content-container">
              <Container>
                {/* Main Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', marginTop: '15px' }}>
                  <ButtonGroup>
                    {['Проекты', 'Прочее'].map((sect) => (
                        <Button
                            key={sect}
                            variant={activeSection === sect ? theme.bsSecondaryVariant : `outline-${theme.bsSecondaryVariant}`}
                            style={{ padding: '8px 30px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}
                            onClick={() => handleSectionChange(sect)}
                        >
                          {sect}
                        </Button>
                    ))}
                  </ButtonGroup>
                </div>

                {/* Sub-Filters */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                  {(activeSection === 'Проекты' ? sections.projects : sections.others).map((cat) => (
                      <Button
                          key={cat}
                          size="sm"
                          variant={filter === cat ? theme.bsSecondaryVariant : `outline-${theme.bsSecondaryVariant}`}
                          style={{ borderRadius: '20px', fontWeight: 600 }}
                          onClick={() => setFilter(cat)}
                      >
                        {cat}
                      </Button>
                  ))}
                </div>

                {/* 3. The Grid: Added 'contain' property for browser performance */}
                {/* The Grid */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: `${GAP}px`,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  minHeight: '100vh',
                  paddingBottom: '80px',
                  contain: 'content'
                }}>
                  {/* We filter out empty columns so 1 item stays centered in the middle */}
                  {columns.filter(col => col.length > 0).map((col, colIndex) => (
                      <div
                          key={`${activeSection}-${filter}-${colIndex}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${GAP}px`,
                            // 1. flex: 1 allows it to grow/shrink based on parent
                            // 2. width: 100% ensures it doesn't overflow on small screens
                            // 3. maxWidth keeps it from getting too huge on big screens
                            flex: '1',
                            width: '100%',
                            maxWidth: `${CARD_MAX_WIDTH}px`,
                            transition: 'all 0.5s ease-in-out'
                          }}
                      >
                        {col.map((item) => (
                            <Fade key={item.title} duration={800}>
                              <ProjectCard
                                  project={item}
                                  isGlobalPaused={isAnyModalOpen}
                                  setGlobalPause={setIsAnyModalOpen}
                              />
                            </Fade>
                        ))}
                      </div>
                  ))}
                </div>
              </Container>
            </div>
        ) : <FallbackSpinner />}
      </>
  );
};

export default Projects;