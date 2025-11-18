import React, { useEffect, useRef } from 'react';

const TeamSection = React.memo(({ title, members, isAdmin, onAddMember, onEdit, onRemove }) => {
  const [openMenuId, setOpenMenuId] = React.useState(null);
  const containerRef = useRef(null);

  // Close the menu when clicking outside the team section
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);
  return (
    <>
      <div className="w-[80%] text-[#858491] text-[5vw] md:text-[20px] font-bold text-center mt-10 mb-2">
        {title}
      </div>
      <div className="w-[80%] h-1 bg-[#858491] bg-opacity-50 mx-auto"></div>

      <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 px-4 md:px-10 mt-8">
        {members.map((member) => (
            <div key={member._id} className="relative w-full">
              {/** three-dots edit button for admins */}
              {isAdmin && (
                <div className="absolute top-2 right-2 z-20">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === member._id ? null : member._id); }}
                    className="bg-black/30 p-1 rounded-full hover:bg-black/50"
                    aria-label={`Open menu for ${member.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  {openMenuId === member._id && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-36 bg-[#171637] border border-[#2b3350] rounded shadow-lg text-white py-1 z-30">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEdit && onEdit(member); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#2b3350]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onRemove && onRemove(member); }}
                        className="w-full text-left px-3 py-2 hover:bg-red-700 text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center md:bg-[#292f45]/30 bg-[#171637] p-6 rounded-lg transition-transform duration-200 ${openMenuId === member._id ? 'scale-105' : 'hover:scale-105'} aspect-w-1 aspect-h-1 md:backdrop-blur-xl`}
              >
                <img
                  src={member.imageUrl}
                  alt={`${member.name} profile`}
                  decoding="async"
                  loading="lazy"
                  className="h-32 md:h-52 w-full object-cover object-center rounded-lg"
                />
                <h2 className="text-xl md:text-2xl font-semibold text-center mt-2">{member.name}</h2>
                <p className="text-gray-400 text-center">{member.designation}</p>
              </a>
            </div>
          ))}
        {isAdmin && (
          <div
            className="flex flex-col items-center justify-center md:bg-[#292f45]/30 bg-[#171637] p-6 rounded-lg transition-transform duration-200 hover:scale-105 aspect-w-1 aspect-h-1 md:backdrop-blur-xl cursor-pointer"
            onClick={onAddMember}
          >
            <span className="text-5xl text-white">+</span>
          </div>
        )}
      </div>
    </>
  );
});

export default React.memo(TeamSection);