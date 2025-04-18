import React, { useEffect, useContext } from 'react'
import { UserContext } from "../auth/UserProvider";
import Login from '../components/Login';

import Profile from '../components/Profile';
import Loader from '../components/Loaders/Loader';

const LoginPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 
  const { user, isLoading, setUser } = useContext(UserContext);
  
  if (isLoading) {
    return <Loader />
  }

  

  return (
    <div className="flex flex-col min-h-screen ">      
      <div className="flex-grow">
        {!user ? <Login setUser={setUser}/>: <Profile user={user} setUser={setUser} isLoading={isLoading}/>}
      </div>

    </div>
  )
}

export default LoginPage

