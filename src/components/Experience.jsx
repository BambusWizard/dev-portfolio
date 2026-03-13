/* eslint-disable */
import React, { useEffect, useState, useContext } from 'react';
import { Timeline, TimelineItem } from 'vertical-timeline-component-for-react';
import { Container } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import yaml from 'js-yaml';
import Header from './Header';
import endpoints from '../constants/endpoints';
import FallbackSpinner from './FallbackSpinner';
import '../css/experience.css';

const styles = {
  ulStyle: {
    listStylePosition: 'outside',
    paddingLeft: 20,
  },
  subtitleContainerStyle: {
    marginTop: 10,
    marginBottom: 10,
  },
  subtitleStyle: {
    display: 'inline-block',
  },
  inlineChild: {
    display: 'inline-block',
  },
  itemStyle: {
    marginBottom: 10,
  },
  glassStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    WebkitBackdropFilter: 'blur(2px)',
    backdropFilter: 'blur(2px)',
    borderRadius: '8px',
    padding: '15px',
  },
};

function Experience(props) {
  const theme = useContext(ThemeContext);
  const { header } = props;
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(endpoints.experiences)
        .then((res) => res.text())
        .then((text) => {
          const doc = yaml.load(text);
          setData(doc.experiences);
        })
        .catch((err) => err);
  }, []);

  return (
      <>
        <Header title={header} />
        {data ? (
            <div className="section-content-container">
              <Container>
                <Timeline lineColor={theme.timelineLineColor}>
                  {data.map((item) => (
                      <TimelineItem
                          key={item.title + item.dateText}
                          dateText={item.dateText}
                          dateInnerStyle={{ background: theme.accentColor }}
                          style={styles.itemStyle}
                          bodyContainerStyle={{ color: theme.color, ...styles.glassStyle }}
                      >
                        <h2 className="item-title">{item.title}</h2>
                        <div style={styles.subtitleContainerStyle}>
                          <h4 style={{ ...styles.subtitleStyle, color: theme.accentColor }}>
                            {item.subtitle}
                          </h4>
                          {item.workType && (
                              <h5 style={styles.inlineChild}>
                                &nbsp;·
                                {' '}
                                {item.workType}
                              </h5>
                          )}
                        </div>
                        <ul style={styles.ulStyle}>
                          {item.workDescription.map((point) => (
                              <li key={point} style={{ marginBottom: '10px' }}>
                                <ReactMarkdown
                                    children={point}
                                    components={{ span: 'span' }}
                                />
                              </li>
                          ))}
                        </ul>
                      </TimelineItem>
                  ))}
                </Timeline>
              </Container>
            </div>
        ) : <FallbackSpinner />}
      </>
  );
}

Experience.propTypes = {
  header: PropTypes.string.isRequired,
};

export default Experience;