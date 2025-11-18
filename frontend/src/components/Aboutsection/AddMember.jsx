import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  Grow,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';
import OpacityLoader from '../Loaders/OpacityLoader';

const primaryColor = '#330075';
const secondaryColor = '#4a007a';
const whiteColor = '#ffffff';
const overlayColor = 'rgba(0, 0, 0, 0.5)';

const CustomTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: primaryColor,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: primaryColor,
    },
    '&:hover fieldset': {
      borderColor: secondaryColor,
    },
    '&.Mui-focused fieldset': {
      borderColor: primaryColor,
    },
  },
});

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: primaryColor,
  color: whiteColor,
  borderRadius: '20px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: secondaryColor,
  },
}));

const AddMember = ({ showForm, handleCancel, subPosition, year, order, refreshMembers, editMode = false, editMember = null }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [memberData, setMemberData] = useState({
    name: '',
    designation: '',
    photo: null,
    subPosition: subPosition,
    year: year,
    email: '',
    linkedinUrl: '',
    order: order || ''
  });

  // Consolidated useEffect to handle initialization and updates
  useEffect(() => {
    if (editMode && editMember) {
      // Populate form with existing member data
      setMemberData({
        name: editMember.name || '',
        designation: editMember.designation || '',
        photo: null, // Keep as null until user uploads a new file
        subPosition: editMember.subPosition || subPosition,
        year: editMember.year || year,
        email: editMember.email || '',
        linkedinUrl: editMember.linkedinUrl || '',
        _id: editMember._id,
        order: typeof editMember.order !== 'undefined' ? editMember.order : (order || ''),
      });

      // If editing, show the existing photo URL
      if (editMember.photo && typeof editMember.photo === 'string') {
        setPreviewUrl(editMember.photo);
      } else {
        setPreviewUrl(null);
      }
    } else {
      // Reset form for new member
      setMemberData({
        name: '',
        designation: '',
        photo: null,
        subPosition: subPosition,
        year: year,
        email: '',
        linkedinUrl: '',
        order: order || ''
      });
      
      // Clear preview
      setPreviewUrl(null);
    }
  }, [editMode, editMember, subPosition, year, order]);

  // Cleanup blob URLs to avoid memory leaks when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update member data
      setMemberData((prevData) => ({
        ...prevData,
        photo: file,
      }));

      // Create preview URL immediately
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // If user cancels file selection, optional: clear or keep previous
      // setPreviewUrl(null); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberData.designation) {
      handleSnackbarOpen('Designation is required.');
      return;
    }

    // require photo when creating a new member
    if (!editMode && !memberData.photo) {
      handleSnackbarOpen('Photo is required for core members.');
      return;
    }

    const formData = new FormData();
    formData.append('name', memberData.name);
    formData.append('designation', memberData.designation);
    formData.append('subPosition', subPosition);
    formData.append('year', year);
    formData.append('email', memberData.email);
    formData.append('linkedinUrl', memberData.linkedinUrl);
    formData.append('order', memberData.order);
    
    if (memberData.photo) {
      formData.append('photo', memberData.photo);
    }

    try {
      setLoading(true);
      const endpoint = editMode ? '/updateCoreMember' : '/addCoreMember';
      if (editMode && memberData._id) formData.append('id', memberData._id);
      
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const data = await response.json();
      if (response.ok) {
        if (refreshMembers) {
          await refreshMembers();
        }
        handleSnackbarOpen(editMode ? 'Member updated successfully!' : 'Member added successfully!');
        handleCancel();
      } else {
        handleSnackbarOpen(data.message || 'Failed to add/update member.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      handleSnackbarOpen('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarOpen = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!showForm) return null;

  return (
    <>
      {loading && <OpacityLoader />}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: overlayColor,
          zIndex: 1000,
        }}
        onClick={handleCancel}
      />
      <Box
        component="form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          p: 4,
          backgroundColor: whiteColor,
          borderRadius: '12px',
          boxShadow: 5,
          zIndex: 1001,
          border: `2px solid ${primaryColor}`,
          maxHeight: '90vh', // Prevent overflow on small screens
          overflowY: 'auto'
        }}
      >
        <Typography variant="h5" sx={{ color: primaryColor, fontWeight: 'bold', mb: 2 }}>
          {editMode ? 'Edit Member' : 'Add New Member'}
        </Typography>

        <Grow in={true} timeout={600}>
          <CustomTextField
            label="Name"
            fullWidth
            value={memberData.name}
            onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px' } }}
          />
        </Grow>

        <Grow in={true} timeout={800}>
          <CustomTextField
            label="Designation"
            fullWidth
            required
            value={memberData.designation}
            onChange={(e) => setMemberData({ ...memberData, designation: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px' } }}
          />
        </Grow>

        <Grow in={true} timeout={800}>
          <CustomTextField
            label="Email"
            fullWidth
            value={memberData.email}
            onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px' } }}
          />
        </Grow>

        <Grow in={true} timeout={800}>
          <CustomTextField
            label="LinkedIn"
            fullWidth
            value={memberData.linkedinUrl}
            onChange={(e) => setMemberData({ ...memberData, linkedinUrl: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px' } }}
          />
        </Grow>

        <Grow in={true} timeout={900}>
          <CustomTextField
            label="Order"
            type="number"
            fullWidth
            value={memberData.order}
            onChange={(e) => setMemberData({ ...memberData, order: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px' } }}
            helperText="Position within the team/year (1 = top). Leave empty to append."
          />
        </Grow>

        <Box mt={2}>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <StyledButton variant="contained" component="span" startIcon={<AddIcon />}>
              Upload Photo
            </StyledButton>
          </label>
          
          {/* Show Filename if available */}
          {memberData.photo && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {memberData.photo.name}
            </Typography>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ 
                  maxWidth: 120, 
                  maxHeight: 120, 
                  borderRadius: 8, 
                  objectFit: 'cover',
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          )}  
        </Box>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <StyledButton variant="contained" type="submit">
            {editMode ? 'Update Member' : 'Add Member'}
          </StyledButton>
          <StyledButton variant="outlined" onClick={handleCancel}>
            Cancel
          </StyledButton>
        </Box>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(AddMember);