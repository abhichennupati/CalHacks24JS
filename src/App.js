// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import HomeScreen from "./Views/HomeScreen";
import Project from "./Views/Project";
import PaperGraph from "./Graph";

const App = () => {
  const [projects, setProjects] = useState([]);

  // Fetch projects from the API when the app loads
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://api.chennupati.dev/get_all_papers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Set the projects state with the fetched data
        setProjects(data.papers);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const updateProjects = (updatedProjects) => {
    setProjects(updatedProjects);
  };

  const updateProject = (updatedProject) => {
    setProjects((prevProjects) =>
        prevProjects.map((project) =>
            project.id === updatedProject.id ? updatedProject : project,
        ),
    );
  };


  return (
      <Router>
        <Routes>
          <Route
              path="/"
              element={
                <HomeScreen projects={projects} updateProjects={updateProjects} />
              }
          />
          <Route
              path="/project/:id"
              element={
                <Project projects={projects} updateProject={updateProject} />
              }
          />
          <Route path="/graph/:id" element={<PaperGraph />} />
        </Routes>
      </Router>
  );
};

export default App;
