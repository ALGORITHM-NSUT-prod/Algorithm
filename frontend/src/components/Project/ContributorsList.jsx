import React from 'react';
import { Grid,Typography } from '@mui/material';

const ContributorsList = ({ project, handleViewProfile }) => {
  if (project.contributors.length === 0) return null;  // Return nothing if no contributors

  return (
    <div>
      <Typography variant="h6" sx={{ mb: 3.5, color: 'white', fontWeight: 'bold' }}> {/* #330080 */}
        Contributors:
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
          maxHeight: '240px',
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
        <div className="max-h-[140px] overflow-y-auto grid grid-cols-2 gap-2 rounded-lg shadow-sm ml-4 w-full">
          {project.contributors.map((contributor, index) => (
            <div
            key={index}
            className="bg-white p-2 rounded-lg shadow-md w-full"
          >
            <p className="font-semibold text-[#330080]">{contributor.name}</p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleViewProfile(contributor);
              }}
              className="text-sm text-[#330080] no-underline hover:text-red-500"
            >
              View Profile  
            </a>

          </div>
          ))}
        </div>
      </Grid>
    </div>
  );
};

export default React.memo(ContributorsList);
