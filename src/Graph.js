// Graph.js
import React, { useState, useEffect } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PaperGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [showSources, setShowSources] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const initialPaperId = id;

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                // Fetch similar papers using the /get_similar_papers endpoint
                const similarPapersResponse = await fetch('https://api.chennupati.dev/get_similar_papers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paper_id: initialPaperId }),
                });

                if (!similarPapersResponse.ok) {
                    throw new Error('Failed to fetch similar papers');
                }

                const similarPapersData = await similarPapersResponse.json();

                if (similarPapersData.error) {
                    throw new Error(similarPapersData.error);
                }

                const similarPapers = similarPapersData.papers;

                // Fetch the initial paper's details
                const initialPaperResponse = await fetch('https://api.chennupati.dev/get_all_papers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!initialPaperResponse.ok) {
                    throw new Error('Failed to fetch initial paper details');
                }

                const allPapersData = await initialPaperResponse.json();

                if (allPapersData.error) {
                    throw new Error(allPapersData.error);
                }

                const initialPaper = allPapersData.papers.find((paper) => paper.id === initialPaperId) || {
                    id: initialPaperId,
                    title: 'Initial Paper',
                    text: '',
                    type: 'paper',
                };

                // Combine initial paper with similar papers
                const allPapers = [
                    {
                        id: initialPaper.id,
                        title: initialPaper.title,
                        text: initialPaper.text,
                        type: 'paper',
                    },
                    ...similarPapers.map((paper) => ({
                        id: paper.id,
                        title: paper.title,
                        text: paper.text,
                        score: parseFloat(paper.score), // Ensure score is a number
                        type: 'paper',
                    })),
                ];

                // Create nodes for papers
                const paperNodes = allPapers.map((paper) => ({
                    id: paper.id,
                    title: paper.title,
                    text: paper.text,
                    type: 'paper',
                }));

                // Create links between the initial paper and similar papers with scores
                const paperLinks = similarPapers.map((paper) => ({
                    source: initialPaperId,
                    target: paper.id,
                    weight: parseFloat(paper.score), // Ensure weight is a number
                }));

                let sourceNodes = [];
                let sourceLinks = [];

                if (showSources) {
                    // Fetch sources linked to each paper using /get_paper_sources
                    const sourceNodesMap = new Map(); // To avoid duplicate sources
                    const sourceLinkPromises = allPapers.map(async (paper) => {
                        const sourcesResponse = await fetch('https://api.chennupati.dev/get_paper_sources', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paper_id: paper.id }),
                        });

                        if (!sourcesResponse.ok) {
                            console.warn(`Failed to fetch sources for paper ${paper.id}`);
                            return;
                        }

                        const sourcesData = await sourcesResponse.json();

                        if (sourcesData.error) {
                            console.warn(`No sources found for paper ${paper.id}: ${sourcesData.error}`);
                            return;
                        }

                        const sources = sourcesData.sources;

                        // Create nodes for sources and links to the paper
                        sources.forEach((source) => {
                            if (!sourceNodesMap.has(source.id)) {
                                sourceNodesMap.set(source.id, {
                                    id: source.id,
                                    title: source.title,
                                    url: source.url,
                                    type: 'source',
                                });
                            }
                            sourceLinks.push({
                                source: source.id,
                                target: paper.id,
                            });
                        });
                    });

                    await Promise.all(sourceLinkPromises);

                    // Convert sourceNodesMap to an array
                    sourceNodes = Array.from(sourceNodesMap.values());
                }

                // Combine nodes and links
                setGraphData({
                    nodes: [...paperNodes, ...sourceNodes],
                    links: [...paperLinks, ...sourceLinks],
                });
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };

        fetchGraphData();
    }, [showSources, initialPaperId]);

    // Toggle function to show/hide sources
    const handleToggle = () => {
        setShowSources(!showSources);
    };

    const handleBack = () => {
        navigate(`/project/${id}`);
    };

    // Updated onNodeClick function
    const handleNodeClick = (node) => {
        if (node.type === 'paper') {
            navigate(`/project/${node.id}`);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Back arrow */}
            <button
                onClick={handleBack}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                <FaArrowLeft size={24} />
            </button>
            <button
                onClick={handleToggle}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
            >
                {showSources ? 'Hide Sources' : 'Show Sources'}
            </button>
            <ForceGraph3D
                graphData={graphData}
                nodeAutoColorBy="type"
                nodeLabel="" // Disable default labels
                nodeThreeObject={(node) => {
                    // Create a sprite for the label
                    const sprite = new SpriteText(node.title);
                    sprite.color = 'black'; // Set text color to black
                    sprite.textHeight = 8;
                    return sprite;
                }}
                nodeThreeObjectExtend={true} // Render the label in addition to the node
                nodeColor={(node) => (node.type === 'paper' ? 'blue' : 'green')}
                linkLabel="" // Disable default link labels
                linkThreeObjectExtend={true}
                linkThreeObject={(link) => {
                    if (link.weight) {
                        const sprite = new SpriteText(`Similarity: ${link.weight.toFixed(2)}`);
                        sprite.color = 'black'; // Set text color to black
                        sprite.textHeight = 2;
                        return sprite;
                    }
                    return null;
                }}
                linkWidth={(link) => (link.weight ? link.weight * 5 : 1)}
                // Adjust link distance based on weight (higher weight = closer nodes)
                linkDistance={(link) => (link.weight ? (1 / link.weight) * 200 : 200)}
                // Updated onNodeClick function
                onNodeClick={handleNodeClick}
                backgroundColor="#ffffff" // Set background to white
            />
        </div>
    );
};

export default PaperGraph;
