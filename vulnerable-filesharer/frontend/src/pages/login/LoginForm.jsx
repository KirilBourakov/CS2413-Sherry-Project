import { motion } from 'framer-motion';
import{ Link, useNavigate } from 'react-router-dom';
import { createRef, useContext, useState } from 'react';
import { AuthContext } from '../../components/providers/authProvider'
import AlertDanger from '../../components/AlertDanger';
import { login, getToken } from './../../scripts/authentication'

const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
};

export default function LoginForm(){
    const [alertView, changeAlertView] = useState(false);
    const [AlertText, setAlertText] = useState('')
    const { authObj, setAuthObj } = useContext(AuthContext)
    
    const nav = useNavigate();
    
    const usernameRef = createRef()
    const passwordRef = createRef()

    const submit = async () => {
        const username = usernameRef.current.value
        const password = passwordRef.current.value
        
        if (username === '' || password === '') {
            alert('Not all fields are filled.')
            return
        }
        let response = await login(username, password)
        setAuthObj(getToken())
        if (response.status === 200){
            return nav("/storage"); 
        }

        return alert(response.detail)
    }
    
    const alert = (text) => {
        setAlertText(text)
        changeAlertView(true);
        setTimeout(() => { 
            changeAlertView(false);
        }, 3000);
    }

    return(
        <form>
            
            {/* user name/ email */}
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input autoComplete='off' type="text" className="form-control" ref={usernameRef} placeholder="Username/Email"/>
            </div>

            {/* password */}
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input autoComplete='off' type="password" className="form-control" ref={passwordRef} placeholder="Password"/>
            </div>

            <div className='d-flex'>
                <motion.button 
                type="button" 
                className="btn btn-primary mt-3 align-self-center" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={submit}>
                    Login
                </motion.button>

                <Link to={'/create-account'} className='ms-auto align-self-center'>Don't have an account?</Link>
            </div> 
            <AlertDanger 
                text={AlertText} 
                see={alertView}
                animate={{ opacity: 1, x: 0}}
                change={{ opacity: 0, x: "-100%" }}
            />
        </form>
    );
}