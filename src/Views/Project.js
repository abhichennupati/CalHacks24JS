// Project.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Split from "react-split";
import SidePanel from "./SourceView";
import Editor from "./Editor";
import "../App.css";
import { FaBars, FaSearch, FaTimes, FaHome } from "react-icons/fa";
import { WiStars } from "react-icons/wi";
import { PiGraphLight } from "react-icons/pi";

const MenuBar = ({ projects }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goHome = () => {
    navigate("/");
    setIsMenuOpen(false);
  };

  // Updated function to use navigate instead of window.location.href
  const goToProject = (projectId) => {
    navigate(`/project/${projectId}`);
    setIsMenuOpen(false);
  };

  return (
      <div className="relative">
        {/* Main toolbar */}
        <div className="flex items-center p-4">
          <FaBars
              onClick={toggleMenu}
              className="text-gray-600 mr-6 cursor-pointer text-xl transition duration-300 ease-in-out transform hover:scale-110"
          />
          <span className="font-bold mr-6 text-lg">FrameResearch</span>
          <button className="ai-commands text-black px-3 py-2 rounded mr-6 border border-black flex items-center">
            <WiStars className="mr-2 text-xl" />
            ai commands
          </button>
          <button className="bg-black text-white px-3 py-2 rounded mr-6 flex items-center">
            <FaSearch className="mr-2" />
            find sources
          </button>
          <div className="flex-grow"></div>

          {/* Graph View Button */}
          <Link to={`/graph/${projects[0]?.id}`}>
            <PiGraphLight className="text-gray-600 cursor-pointer text-2xl" />
          </Link>
        </div>

        {/* Slide-out menu */}
        <div
            className={`fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 shadow-lg z-20 transition-all duration-300 ease-in-out transform ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Home button with close icon */}
          <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={goHome}
          >
            <div className="flex items-center">
              <FaHome className="text-gray-600 mr-2 text-xl" />
              <span className="font-bold text-lg">Home</span>
            </div>
            <FaTimes
                onClick={toggleMenu}
                className="text-gray-600 cursor-pointer text-xl"
            />
          </div>

          {/* Project links */}
          <ul className="py-2">
            {projects.map((project) => (
                <li key={project.id}>
                  <div
                      onClick={() => goToProject(project.id)}
                      className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {project.title}
                  </div>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
};

const Project = ({ projects, updateProject }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectIfNeeded = async () => {
      let foundProject = projects.find((p) => p.id === id);

      if (!foundProject) {
        // Fetch the project from the API
        try {
          const response = await fetch('https://api.chennupati.dev/get_paper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paper_id: id }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch project');
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          foundProject = data.paper;

          // Optionally, update the projects state in App.js
          // updateProject(foundProject);

        } catch (error) {
          console.error('Error fetching project:', error);
          navigate('/');
          return;
        }
      }

      setProject(foundProject);
    };

    fetchProjectIfNeeded();
  }, [id, projects, navigate]);

  if (!project) {
    return <div>Loading project...</div>;
  }

  const onAddSource = (newSource) => {
    const updatedProject = {
      ...project,
      sources: [...(project.sources || []), newSource],
    };
    updateProject(updatedProject);
    setProject(updatedProject);
  };

  const onUpdateContent = (newContent) => {
    const updatedProject = {
      ...project,
      content: newContent,
    };
    updateProject(updatedProject);
    setProject(updatedProject);
  };

  const onUpdateTitle = (newTitle) => {
    const updatedProject = {
      ...project,
      title: newTitle,
    };
    updateProject(updatedProject);
    setProject(updatedProject);
  };

  return (
      <Split
          sizes={[65, 35]}
          minSize={[300, 200]}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="flex h-screen"
      >
        <div className="flex flex-col left-side">
          <MenuBar projects={projects} />
          <div className="p-4 overflow-y-auto flex-grow">
            <Editor
                id={project.id}
                title={project.title}
                content={project.content}
                onUpdateContent={onUpdateContent}
                onUpdateTitle={onUpdateTitle}
            />
          </div>
        </div>
        <div className="overflow-y-auto right-side">
          <SidePanel
              sources={project.sources || []}
              notes={project.notes || []}
              onAddSource={onAddSource}
              currPaper={project.id}
          />
        </div>
      </Split>
  );
};

export default Project;
