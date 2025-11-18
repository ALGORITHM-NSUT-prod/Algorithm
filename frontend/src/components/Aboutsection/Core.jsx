import React, { useMemo, useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import TeamSection from './TeamSection';
import { UserContext, AboutContext } from '../../auth/UserProvider';
import AddMember from './AddMember'; // Import the new component
import Loader from '../Loaders/Loader';
import OpacityLoader from '../Loaders/OpacityLoader';

const Core = ({ members }) => {
  const { user, userLoading } = useContext(UserContext);
  const isAdmin = !!(user && user.admin);

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditMemberForm, setShowEditMemberForm] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const { fetchMembers } = useContext(AboutContext);

  const refreshMembers = async () => {
    try {
      setRefreshing(true);
      await fetchMembers();
    } catch (err) {
      console.error('Error refreshing members:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const cloudinaryBucket = useMemo(() => import.meta.env.VITE_CLOUDINARY_BUCKET, []);
  const mappedMembers = useMemo(() => {
// ... existing code ...
    return {
      management: members.management.map(member => ({
        ...member,
        imageUrl: `${cloudinaryBucket}${member.imageUrl}`,
      })),
      operation: members.operation.map(member => ({
        ...member,
        imageUrl: `${cloudinaryBucket}${member.imageUrl}`,
      })),
      techhead: members.techhead.map(member => ({
        ...member,
        imageUrl: `${cloudinaryBucket}${member.imageUrl}`,
      })),
    };
  }, [members, cloudinaryBucket]);

  // Panels state: will be derived from available years in the members data
  const [panels, setPanels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const addPanel = () => {
// ... existing code ...
    const lastYear = panels[panels.length - 1].year;
    const newYear = lastYear + 1;
    const newPanel = { year: newYear, label: `Core Team '${String(newYear).slice(-2)}` };
    setPanels(prev => [...prev, newPanel]);
    setActiveIndex(panels.length); // focus newly added panel
  };

  // derive available years from members (all teams) and default to latest
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    const pushYears = (arr) => arr && arr.forEach(m => { if (m && m.year) yearsSet.add(m.year); });
    pushYears(mappedMembers.management);
    pushYears(mappedMembers.operation);
    pushYears(mappedMembers.techhead);
    const years = Array.from(yearsSet).sort((a, b) => a - b);
    return years.length ? years : [2024];
  }, [mappedMembers]);

  // build panels from available years and default to the latest year
  React.useEffect(() => {
    const p = availableYears.map(y => ({ year: y, label: `Core Team '${String(y).slice(-2)}` }));
    setPanels(p);
    setActiveIndex(p.length - 1 >= 0 ? p.length - 1 : 0);
  }, [availableYears]);

  // Determine which members to show for the active panel
  // For now only '24' (year 24) uses the real members; other years are empty placeholders
  const membersForActiveYear = useMemo(() => {
    const activeYear = panels[activeIndex]?.year;
    if (!activeYear) {
      return { management: [], operation: [], techhead: [] };
    }

    const filterByYear = (teamMembers) =>
      teamMembers.filter((member) => member.year === activeYear);

    return {
      management: filterByYear(mappedMembers.management),
      operation: filterByYear(mappedMembers.operation),
      techhead: filterByYear(mappedMembers.techhead),
    };
  }, [panels, activeIndex, mappedMembers]);

  const handleAddMemberClick = (team) => {
    setSelectedTeam(team);
    setShowAddMemberForm(true);
  };

  const handleEditClick = (member) => {
    setEditMember(member);
    setShowEditMemberForm(true);
  };
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const handleRemoveClick = (member) => {
    if (!member || !member._id) return;
    // open confirmation dialog
    setDeleteCandidate(member);
  };

  const confirmDelete = async () => {
    const member = deleteCandidate;
    if (!member || !member._id) {
      setDeleteCandidate(null);
      return;
    }
    try {
      setRefreshing(true);
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/deleteCoreMember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: member._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Delete failed', data);
        // show an alert as fallback
        alert(data.message || 'Failed to delete');
      }
      await refreshMembers();
    } catch (err) {
      console.error('Error deleting member', err);
      alert('Error deleting member');
    } finally {
      setRefreshing(false);
      setDeleteCandidate(null);
    }
  };

  const handleCancelAddMember = () => {
    setShowAddMemberForm(false);
    setSelectedTeam('');
  };

  if (userLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-row items-start text-white py-10 w-full mb-24 relative">
      {refreshing && <OpacityLoader />}
      {/* Left arrow to move to previous panel */}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Years selector (horizontal) with Add Year button on the right (mobile-friendly) */}
        <div className="w-full flex items-center justify-center mb-6">
          <div className="w-full max-w-5xl flex items-center justify-center px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar items-center justify-center">
              {panels.map((p, idx) => (
                <button
                  key={p.year}
                  onClick={() => setActiveIndex(idx)}
                  className={`whitespace-nowrap text-sm md:text-base py-2 px-3 rounded ${idx === activeIndex ? 'bg-[#2b3350] text-white' : 'bg-[#171637] text-[#c8c8d6]'} `}
                  aria-pressed={idx === activeIndex}
                >
                  {p.label}
                </button>
              ))}

              {isAdmin && (
                // Add Year as part of the horizontal list
                <button
                  onClick={addPanel}
                  className="whitespace-nowrap text-sm md:text-base py-2 px-3 rounded bg-green-600 hover:bg-green-700 text-white font-bold flex items-center"
                  aria-label="Add core team year"
                >
                  <span className="mr-2 text-lg">+</span>
                  <span className="hidden md:inline">Add Year</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-[10vw] md:text-[100px] font-bold mb-16 font-mono">
          {panels[activeIndex]?.label || "Core Team"}
        </h1>

        <TeamSection
          title="MANAGEMENT"
          members={membersForActiveYear.management}
          isAdmin={isAdmin}
          onAddMember={() => handleAddMemberClick('management')}
          onEdit={(m) => handleEditClick(m)}
          onRemove={(m) => handleRemoveClick(m)}
        />
        <TeamSection
          title="Operations Team"
          members={membersForActiveYear.operation}
          isAdmin={isAdmin}
          onAddMember={() => handleAddMemberClick('operation')}
          onEdit={(m) => handleEditClick(m)}
          onRemove={(m) => handleRemoveClick(m)}
        />
        <TeamSection
          title="Tech Heads"
          members={membersForActiveYear.techhead}
          isAdmin={isAdmin}
          onAddMember={() => handleAddMemberClick('techhead')}
          onEdit={(m) => handleEditClick(m)}
          onRemove={(m) => handleRemoveClick(m)}
        />
      </div>
      
      <AddMember
        showForm={showAddMemberForm}
        handleCancel={handleCancelAddMember}
        subPosition={selectedTeam}
        year={panels[activeIndex]?.year}
        order={selectedTeam ? membersForActiveYear[selectedTeam].length + 1 : 1}
        maxOrder={selectedTeam ? membersForActiveYear[selectedTeam].length + 1 : 1}
        refreshMembers={refreshMembers}
      />
      <AddMember
        showForm={showEditMemberForm}
        handleCancel={() => { setShowEditMemberForm(false); setEditMember(null); }}
        editMode={true}
        editMember={editMember}
        subPosition={editMember?.subPosition}
        year={editMember?.year}
        order={editMember ? membersForActiveYear[editMember.subPosition]?.findIndex(m => m._id === editMember._id) + 1 : 1}
        maxOrder={editMember ? membersForActiveYear[editMember.subPosition]?.length || 1 : 1}
        refreshMembers={refreshMembers}
      />
      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Delete ${deleteCandidate?.name}? This will remove the member and reorder others in the same team/year.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCandidate(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(Core);
