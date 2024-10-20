import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaHome, FaUser, FaCog } from "react-icons/fa";
import "./HomeScreen.css";
import { addPaper } from "../Api.js";

const HomeScreen = ({ projects, updateProjects }) => {
  const addProject = async () => {
    try {
      const result = await addPaper(
          "New Project",
          "this is my project",
          "lebron",
      );
      const newProject = {
        id: result.id.toString(), // Ensure ID is a string
        title: "New Project",
        content: "this is my project",
        sources: [],
        notes: [],
      };
      updateProjects([...projects, newProject]);
    } catch (error) {
      console.error("Error adding project:", error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Left Menu */}
        {/* ... existing code ... */}

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header section */}
          {/* ... existing code ... */}

          {/* Recently visited projects section */}
          <div className="w-full max-w-5xl">
            <h2 className="text-2xl font-semibold mb-4">Recently Visited</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {projects.map((project) => (
                  <Link
                      key={project.id}
                      to={`/project/${project.id}`}
                      className="block"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-square">
                      {/* Red top part of the project box */}
                      <div className="bg-red-500 h-1/3"></div>
                      {/* Bottom part with the title */}
                      <div className="p-4 h-2/3 flex items-center justify-center">
                        <h3 className="font-semibold text-center">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
              ))}

              {/* Add New Project button */}
              <button
                  onClick={addProject}
                  className="bg-blue-500 hover:bg-blue-700 text-white aspect-square rounded-lg shadow-md flex items-center justify-center"
              >
                <FaPlus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HomeScreen;
