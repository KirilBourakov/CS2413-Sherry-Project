import { motion } from 'framer-motion'
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../components/providers/authProvider'
import { logout, getToken } from '../../scripts/authentication';
import { useNavigate } from 'react-router-dom';

export default function Logout(){
    const { authObj, setAuthObj } = useContext(AuthContext)
    
    const nav = useNavigate()
    useEffect(() => {
        const run = async () => {
            if (await logout()){
                setAuthObj(getToken())
                nav('/')
            }
        }
        run()
    }, [])
    return(
        <div className='d-flex flex-column align-items-center my-auto'>
            <div className='d-flex'>
                <h1>Logging out</h1>
                <motion.h1
                animate={{ y:-25 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                >
                .
                </motion.h1>
                <motion.h1
                animate={{ y:-20 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                >
                .
                </motion.h1>
                <motion.h1
                animate={{ y:-25 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                >
                .
                </motion.h1>
            </div>

            <div animation="border" size="lg" variant="danger">
                <span className="visually-hidden">Logging out...</span>
            </div>
        </div>
    );
};