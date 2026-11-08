import { useContext, useEffect, useState } from "react";
import{ Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import {logout, authedJSONFetch} from '../../scripts/authentication'

export default function UserName() {
    const [user, setUser] = useState([])
    
    const nav = useNavigate()
    useEffect(() =>{
        const getUser = async () =>{
            const response = await authedJSONFetch(user/get, "GET");
            if (response.status !== 200){
                await logout()
                return nav("/login")
            }
            const body = await response.json()
            setUser(body)
        }
        getUser()
    }, []);

    return(
        <motion.div className="me-auto" whileHover={{ scale: 1.1 }}>
        <Link to='/storage'>
        <h5 className="text-muted my-auto">
            {user &&
                <>{user.username}
                <i className="ms-1 font-italic"><small>#{user.pk}</small></i>
                </>
            }
            
        </h5>
        </Link>
        </motion.div>
    )
};