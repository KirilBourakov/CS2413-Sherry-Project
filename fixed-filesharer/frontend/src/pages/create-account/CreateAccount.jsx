import { motion } from 'framer-motion';
import { createRef, useContext, useState } from 'react';
import{ Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/providers/authProvider'
import { getCookie } from '../../scripts/cookies'
import { register, login, getToken } from '../../scripts/authentication'

const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
};

export default function CreateAccount() {
    const [alertShow, changeAlertShow] = useState(false);
    const [alertText, changeAlertText] = useState('');
    const nav = useNavigate()
    const { authObj, setAuthObj } = useContext(AuthContext)
    
    //create ref
    const usernameRef = createRef();
    const passwordRef = createRef();
    const conpassRef = createRef();

    const createaccount = async () => {
        const usernameValue = usernameRef.current.value;
        const passwordValue = passwordRef.current.value;
        const conpassValue = conpassRef.current.value;

        const fieldIsEmpty = usernameValue === '' || passwordValue === '' || conpassValue === ''
        if (fieldIsEmpty){
            alert('All needed fields not filled.');
            return true;
        }
        if (passwordValue !== conpassValue) {
            alert('Passwords must match.');
            return true;
        };  
        let response = await register(usernameValue, passwordValue)
        if (response === 201){
            let response = await login(usernameValue, passwordValue)
            setAuthObj(getToken())
            return nav("/storage"); 
        }
        return alert('Something went wrong, make sure your information is valid, and try again later.');
    }
 
    const alert = (text) => {
        changeAlertText(text);
        changeAlertShow(true);
    };

    return(
        <form>
            

            {/* user name */}
            <div className="form-group">
                <label htmlFor="username">User Name</label>
                <input autoComplete='off' type="text" className="form-control" ref={usernameRef} placeholder="User Name"/>
                
            </div>

            {/* password */}
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input autoComplete='off' type="password" className="form-control" ref={passwordRef} placeholder="Password"/>
            </div>

            {/* confirm password */}
            <div className="form-group"> 
                <label htmlFor="confirm password">Confirm Password</label>
                <input autoComplete='off' type="password" className="form-control" ref={conpassRef} placeholder="Confirm Password"/>
                <small className="form-text text-muted">Passwords <strong>must</strong> match</small>
            </div>

            <div className='d-flex'>
                <motion.button 
                type="button" 
                className="btn btn-primary mt-3 align-self-center" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {createaccount()}}>
                    Create account
                </motion.button>

                <Link to={'/login'} className='ms-auto align-self-center link'>Already have an account?</Link>
            </div>    

            <motion.div 
            animate={alertShow ? "open" : "closed"}
            variants={variants}
            id="probalert"
            className="alert alert-danger mt-4" role="alert">
                {alertText}
            </motion.div>
        </form>
        
    );
};
