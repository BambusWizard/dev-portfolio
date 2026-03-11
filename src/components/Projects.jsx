/* eslint-disable */
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Container, Button, ButtonGroup } from 'react-bootstrap';
import { ThemeContext } from 'styled-components';
import Fade from 'react-reveal/Fade';
import endpoints from '../constants/endpoints';
import ProjectCard from './projects/ProjectCard';
import FallbackSpinner from './FallbackSpinner';

const Projects = (props) => {
  const theme = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);

  // Top Level (Section) and Sub Level (Category) states
  const [activeSection, setActiveSection] = useState('Проекты');
  const [filter, setFilter] = useState('Все');

  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch(endpoints.projects, { method: 'GET' })
        .then((res) => res.json())
        .then((res) => setData(res))
        .catch((err) => console.error(err));
  }, []);

  /**
   * Grouping Logic:
   * 'Инструменты' and 'Навыки' go to "Прочее".
   * Everything else stays in "Проекты".
   */
  const sections = useMemo(() => {
    if (!data) return { projects: [], others: [] };
    const otherTitles = ['Инструменты', 'Навыки'];
    const allCats = Array.from(new Set(data.projects.map(p => p.category).filter(Boolean)));

    return {
      projects: ['Все', ...allCats.filter(c => !otherTitles.includes(c)).sort()],
      others: allCats.filter(c => otherTitles.includes(c)).sort()
    };
  }, [data]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Reset the filter to the first item of the new group
    setFilter(section === 'Проекты' ? 'Все' : sections.others[0]);
  };

  const filteredProjects = useMemo(() => {
    const projects = data?.projects || [];
    if (filter === 'Все') {
      return projects.filter((p) => p.IsIncludeInAll === true);
    }
    return projects.filter((p) => p.category === filter);
  }, [data, filter]);

  // Masonry layout variables
  const CARD_MAX_WIDTH = 320;
  const GAP = 25;
  const MAX_COLS = 4;
  const colCount = Math.max(1, Math.min(MAX_COLS, Math.floor(width / (CARD_MAX_WIDTH + GAP))));

  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => []);
    filteredProjects.forEach((project, index) => {
      cols[index % colCount].push(project);
    });
    return cols;
  }, [filteredProjects, colCount]);

  return (
      <>
        {data ? (
            <div className="section-content-container">
              <Container>
                {/* FIRST ROW: Group Selection */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', marginTop: '15px'  }}>
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

                {/* SECOND ROW: Specific Categories */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '30px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
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

                {/* Grid Display */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: `${GAP}px`,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  minHeight: '100vh'
                }}>
                  {columns.filter(col => col.length > 0).map((col, colIndex) => (
                      <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, flex: '0 0 auto', maxWidth: `${CARD_MAX_WIDTH}px` }}>
                        {col.map((project) => (
                            <Fade key={project.title} duration={800}>
                              <ProjectCard
                                  project={project}
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