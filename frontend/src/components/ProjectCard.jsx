import React, { useState, useEffect } from 'react';
import JoinRequestModal from './JoinRequestModal';
import DeleteRequestModal from './deleteProjectModal';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Button, Box, Link, useMediaQuery, useTheme, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddProject from './addProject';
import { motion } from 'framer-motion';
import { Fullscreen } from 'lucide-react';
import { FaBlackTie } from 'react-icons/fa';
import "slick-carousel/slick/slick.css"; // Import slick carousel CSS
import "slick-carousel/slick/slick-theme.css";
import UserProfileModal from './UserProfileModal';


import { IconButton, Tooltip } from '@mui/material';



const ProjectCard = ({ project, isOngoing, refreshProjects }) => {
  const [showappModal, setShowappModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userProfile')));
  const navigate = useNavigate();
  const [editProject, setEditProject] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [showUserProfileModal, setShowUserProfileModal] = useState(false); // State for user profile modal
  const [selectedUser, setSelectedUser] = useState(null); // State for the selected user

  const postData = async () => {
    try {
      const response = await fetch('http://localhost:5000/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: project.title, lead: project.lead._id })
      });
      const data = await response.json();
      console.log(data.message);
      return true;
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const handleApplication = async (id, state) => {
    try {
      const applicants = await fetch('http://localhost:5000/handleApplication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: project.title, applicant: id, state: state })
      });
      const data = await applicants.json();
      console.log(data.message);
      refreshProjects();
    } catch (error) {
      console.error('Error updating application state:', error);
    }
  };

  useEffect(() => {
    if (editProject) {
      setEditProject(false);
    }
  }, [isExpanded])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setShowappModal(false);
    setDeleteModal(false);
    setEditModal(false);
    setShowUserProfileModal(false);
  };

  const handleDeleteRequest = () => {
    setDeleteModal(true);
  };

  const handleDeletesend = async () => {
    try {
      await fetch('http://localhost:5000/deleteProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: project.title })
      });
      refreshProjects();
      toggleExpand();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleJoinRequest = () => {
    setShowappModal(true);
  };

  const handleSendRequest = () => {
    if (postData()) {
      setApplication(false);
    } else {
      refreshProjects();
    }
    setShowappModal(false);
  };
  const handleViewProfile = (userDetails) => {
    setSelectedUser(userDetails); // Set the selected user details
    setShowUserProfileModal(true); // Open the user profile modal
  };

  useEffect(() => {
    if (editProject) {
      setEditProject(false);
    }
  }, [isExpanded])

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,           // Enables autoplay
    autoplaySpeed: 3000,      // Speed in milliseconds (3 seconds per slide)
  };
  return (
    <React.Fragment>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleExpand}
        ></div>
      )}
      <div
        onClick={toggleExpand}
        className={`relative p-4 w-full rounded-lg transition-all duration-300 ease-in-out cursor-pointer 
        ${isExpanded ? 'scale-110 z-30' : 'z-10'}`}
      >
        <Paper
          sx={{
            background: 'linear-gradient(to right, #ffffff)',
            backgroundColor: "#15142F",
            borderRadius: 3,
            boxShadow: 6,
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
            cursor: 'pointer',
            zIndex: -2,
            color: 'black', // Corrected this line
            '&:hover': { boxShadow: 12 },
            width: '100%', // Ensure the paper takes full width
            maxWidth: '600px', // Max width to prevent stretching on large screens
            mx: 'auto', // Center the paper on larger screens
          }}
          onClick={toggleExpand}
        >


          <div>
            <AddProject
              refreshProjects={refreshProjects}
              showadd={false}
              edit={editProject}
              setEditState={setEditProject}
              project={project}
            />
          </div>
          <div style={{
            background: 'white', // Changed from 'white' to '#330080'
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            clipPath: 'path("M0,100 C200,200 400,0 600,100 L600,0 L0,0 Z")',
            marginBottom: "0px"
          }}>
            <Typography
              variant={isExpanded ? 'h5' : 'h4'}
              component="h3"
              sx={{
                background: '#18142F', // Changed from 'white' to '#330080'
                WebkitBackgroundClip: 'text',
                color: 'white', // Changed from 'transparent' to 'white'
                transition: 'all 0.3s',
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                position: 'relative',
                zIndex: 1,
                textAlign: 'center', // Center text horizontally
                fontFamily: "'Cursive', sans-serif", // Fancy font
              }}
            >
              <span style={{
                position: 'relative',
                zIndex: 2,
                color: '#330080', // Changed from '#330080' to 'white'
                padding: '60px 10px 30px',
              }}>
                {project.title}
              </span>
            </Typography>
          </div>

          {/* Carousel for Project Images */}
          <div style={{ backgroundColor: "#18142F" }}>
            {project.images && project.images.length > 0 && (
              <Box
                sx={{
                  position: 'relative', // Makes gradient overlays position correctly
                  width: '100%',
                  maxWidth: '100%',
                  aspectRatio: '4 / 3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#18142F'
                }}
              >

                {/* Carousel or Single Image */}
                {project.images.length === 1 ? (
                  <Box
                    component="img"
                    src={project.images[0]}
                    loading="lazy"
                    alt="Project image"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 1,
                    }}
                  />
                ) : (
                  <Slider {...carouselSettings} style={{ marginLeft: "2.5%", maxWidth: '95%', overflow: 'hidden', borderRadius: '10px', zIndex: 1, background: '#18142F' }}>
                    {project.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative', width: '100%', maxWidth: '100%', aspectRatio: '4 / 3', borderRadius: '10px', overflow: 'hidden', background: '#18142F' }}>
                        <Box
                          component="img"
                          src={image}
                          loading="lazy"
                          alt={`Project image ${index + 1}`}
                          sx={{
                            background: '#18142F',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            border: 'none',        // Remove any border
                            margin: 0,            // Remove any margin
                            padding: 0,           // Remove any padding
                            display: 'block',      // Prevent line under the image
                          }}
                        />

                      </Box>
                    ))}
                  </Slider>
                )}
              </Box>
            )}
          </div>


          <Box sx={{ backgroundColor: '#18142F', p: 3 }}>





            <Typography
              variant="body1"
              sx={{ position: 'realtive', display: 'flex', color: 'white', animation: 'fadeIn 0.5s ease-in-out', fontSize: '17px', mb: 2 }}
            >
              {!isExpanded && project.description.length > 150
                ? `${project.description.slice(0, 150)}...`
                : project.description}
            </Typography>

            {/* Action Buttons for Project Lead */}

            {/* Expanded View */}
            {isExpanded && (
              <Box sx={{ mt: 0 }}>
                {user && project.lead._id === user._id && (
                  <Box
                    sx={{
                      postion: 'relative',
                      display: 'flex',
                      gap: 2,
                      mt: 2,
                      justifyContent: 'flex-end', // Aligns the buttons to the right
                    }}
                  >
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        sx={{
                          backgroundColor: '#b91c1c',
                          '&:hover': { backgroundColor: '#991b1b' },
                          transition: 'background-color 0.3s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest();
                        }}
                      >
                        <DeleteIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={editProject ? "Cancel Edit" : "Edit"} arrow>
                      <IconButton
                        sx={{
                          backgroundColor: '#f59e0b',
                          '&:hover': { backgroundColor: '#d97706' },
                          transition: 'background-color 0.3s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProject((prev) => !prev);
                        }}
                      >
                        <EditIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* Project Lead Section */}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}> {/* #330080 */}
                  Project Lead:
                </Typography>
                <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, mt: 2, mb: 3 }}>
                  <Typography variant="body1" color="#330080" sx={{ fontWeight: 'bold' }}>{project.lead.name}</Typography>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewProfile(project.lead); // Pass the lead directly

                      console.log(project.lead);
                    }}
                    sx={{ color: '#330080', textDecoration: 'none', '&:hover': { color: 'red' } }}
                  >
                    View Profile
                  </Link>
                </Box>

                {/* Contributors Section */}
                {project.contributors.length != 0 && <Typography variant="h6" sx={{ mb: 3.5, color: 'white', fontWeight: 'bold' }}> {/* #330080 */}
                  Contributors:
                </Typography>}
                <Grid
                  container
                  spacing={2}
                  sx={{
                    mb: 3,
                    maxHeight: '140px',
                    overflowY: 'auto',
                    pr: 1,
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#aaa',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: '#888',
                    },
                  }}
                >
                  <div className="max-h-[140px] overflow-y-auto grid grid-cols-2 gap-2 rounded-lg shadow-md ml-4 w-full">
                    {project.contributors.map((contributor, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded-lg shadow-md w-full"
                      >
                        <p className="font-semibold text-[#330080]">{contributor.name}</p>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewProfile(contributor); // Pass contributor details
                          }}
                          sx={{ fontSize: '0.9rem', color: '#330080', textDecoration: 'none', '&:hover': { color: 'red' } }}
                        >
                          View Profile
                        </Link>
                      </div>
                    ))}
                  </div>


                </Grid>
                <UserProfileModal
                  isOpen={showUserProfileModal}
                  onClose={() => setShowUserProfileModal(false)}
                  userDetails={selectedUser} // Pass the selected user details to the modal
                />

                {/* Applicants Section */}
                {project.applicants.length !== 0 &&
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}> {/* #330080 */}
                    Applications:
                  </Typography>
                }
                <Box sx={{
                  maxHeight: '100px',
                  overflowY: 'auto',
                  pr: 1,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#aaa',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#888',
                  },
                }}>{/*#281450 */}

                  {project.applicants.map((applicant, index) => (
                    <Box
                      key={index}
                      sx={{
                        backgroundColor: 'white',
                        p: 1,
                        mb: 1,
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',

                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography color="#330080">
                          {applicant.name}
                        </Typography>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewProfile(applicant); // Pass contributor details
                          }}
                          sx={{ color: '#330080', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 400, '&:hover': { color: 'red' } }}

                        >
                          View Profile
                        </Link>
                      </Box>

                      <Box>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{
                            mr: 1,
                            fontSize: '0.7rem',    // Smaller font size
                            padding: '5px 8px',     // Reduced padding
                            minWidth: 'auto',       // Remove default minWidth
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplication(applicant._id, 1);
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          sx={{
                            fontSize: '0.7rem',     // Smaller font size
                            padding: '5px 8px',     // Reduced padding
                            minWidth: 'auto',       // Remove default minWidth
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplication(applicant._id, 0);
                          }}
                        >
                          Decline
                        </Button>
                      </Box>

                    </Box>
                  ))}
                  <UserProfileModal
                    isOpen={showUserProfileModal}
                    onClose={() => setShowUserProfileModal(false)}
                    userDetails={selectedUser} // Pass the selected user details to the modal
                  />
                </Box>
              </Box>
            )}

            {isOngoing && (
              <React.Fragment>
                {user ? (
                  project.applicable && project.lead._id !== user._id ? (


                    user.githubProfile ? (<button
                      className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRequest();
                      }}
                    >Request to Join </button>) :
                      (<button
                        className="mt-2 py-2 px-4 bg-[#330080] text-white rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Add Github to apply
                      </button>)

                  ) : (
                    <button
                      className="mt-2 py-2 px-4 bg-[#330080] text-white rounded-lg cursor-not-allowed"
                      disabled
                    >
                      Already Applied
                    </button>
                  )
                ) : (
                  <button
                    className="mt-8 py-2 px-4 bg-[#40199a] hover:bg-green-800 text-white rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/login');
                    }}
                  >
                    Login to apply
                  </button>
                )}
              </React.Fragment>
            )}


            {deleteModal && (
              <DeleteRequestModal
                isOpen={deleteModal}
                project={project}
                onClose={handleCloseModal}
                onDelete={handleDeletesend}
              />
            )}

            {/* Modal for sending join request */}
            {showappModal && (
              <JoinRequestModal
                isOpen={showappModal}
                project={project}
                onClose={handleCloseModal}
                onSend={handleSendRequest}
              />
            )}

            {/* GitHub Link */}
            <Box sx={{ mt: 2 }}>
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                sx={{
                  padding: "5px",
                  borderRadius: '6px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'inline-block',
                  transition: 'color 0.3s ease',
                  zIndex: 2,

                  '&:hover': {
                    color: '#330080',
                    zIndex: 2,// Transition text color on hover
                  },

                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '100%',
                    backgroundColor: 'white',
                    transition: 'width 0.3s ease, left 0.5s ease',
                    transform: 'translate(-50%, -50%)',
                    zIndex: -1, // Ensures background is behind the text
                  },

                  '&:hover::before': {
                    width: '100%'
                  },
                }}
              >
                View Project on GitHub
              </Link>
            </Box>

          </Box>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default ProjectCard;
