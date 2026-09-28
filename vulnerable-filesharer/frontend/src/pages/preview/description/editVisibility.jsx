import { createRef, useContext, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import AlertDanger from "../../../components/AlertDanger";
import AlertSuccess from '../../../components/AlertSuccess'
import { AuthContext } from "../../../components/providers/authProvider";

const variants = {
    HoverButton:{
        scale: 1.06,
        transition: {
            repeat: Infinity,
            repeatType: 'reverse', 
            duration: .3
        }
    },
    open: { opacity: 1, y:0 },
    closed: { opacity: 0, y:'30px' },
};

export default function EditVisibility(props){
    const { id } = useParams();
    const pub = props.isPublic
    const shared = props.shared
    const update = props.update
    const { authObj, setAuthObj } = useContext(AuthContext)

    //error state
    const [errorView, setErrorView] = useState(false)
    const [errorText, setErrorText] = useState('')

    //success state
    const [successView, setSuccessView] = useState(false)
    const [successText, setSuccessText] = useState('')

    //ref
    const removeUserRef = createRef()
    const addUserRef = createRef()

    const changePrivate = async () => {
        const response = await fetch(`/storage/fileInfo/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Token ${authObj.token}`,  
            },
            method: 'PATCH',
            body: JSON.stringify({
                public: !pub
            })
        })
        console.log(response.status)
        if(response.status === 200){
            update()
        }
        return;
    }

    const alterUser = async (action, user) => {
        const response = await fetch(`/storage/fileInfo/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Token ${authObj.token}`,  
            },
            method: 'POST',
            body: JSON.stringify({
                user: user,
                action: action
            })
        })
        console.log(response.status)
        if(response.status === 200){
            update()
        }
        return;
    }

    const alertError = (msg) => {
        setErrorText(msg)
        setErrorView(true);
        setTimeout(() => { setErrorView(false); }, 2000);
    }

    const alertSuccess = (msg) => {
        setSuccessText(msg)
        setSuccessView(true);
        setTimeout(() => { setSuccessView(false); }, 2000);
    }

    if (pub){
        return(
            <div className='d-flex align-items-start mt-3'>
                <h3 className="me-2">Currently Public</h3>
                <motion.button 
                onClick={changePrivate}
                whileHover={'HoverDelete'}
                variants={variants} 
                className="btn btn-primary ms-2">
                    Make Private
                </motion.button>
            </div>
        )
    } else{
        return(
            <>
            <div className='d-flex flex-column align-items-start mt-3 mb-1'>
            
                {/* remove user */}
                <hr className='subdescription align-self-center'/>
                <div className="row">
                    <div className="col-4 pe-0">
                        <motion.button 
                        onClick={() => alterUser('remove', removeUserRef.current.value)}
                        whileHover={'HoverDelete'}
                        variants={variants} 
                        className="btn btn-outline-primary mb-1">
                            Remove User
                        </motion.button>
                    </div>
                    <div className="col-8">
                        <select className="select" ref={removeUserRef}>
                            <option defaultValue>Remove User From Shared With</option>
                            
                            {shared &&
                                shared.map((user) => {
                                return(
                                    <option key={user.id} value={`#${user.id}`}>{user.username}</option>
                                )
                            })
                            
                            }
                            
                        </select>
                    </div>
                </div>

                {/* add user */}
                <hr className='subdescription align-self-center'/>
                <div className="row">
                    <div className="col-4 pe-0">
                        <motion.button 
                        onClick={() => alterUser('add', addUserRef.current.value)}
                        whileHover={'HoverDelete'}
                        variants={variants} 
                        className="btn btn-outline-primary mb-1">
                            Add user
                        </motion.button>
                    </div>
                    <div className="col-8 ps-0 pe-1">
                        <div className="input-group">
                            <input type='text' ref={addUserRef} className="form-control" placeholder='Name or user id'></input>
                        </div>
                    </div>
                    <small className="form-text text-muted mb-3">Use a # if adding by id</small>
                </div>

                <motion.button 
                onClick={changePrivate}
                whileHover={'HoverDelete'}
                variants={variants} 
                className="btn btn-outline-primary mb-1 me-1">
                    Make Public
                </motion.button>
            </div>

                <AlertDanger 
                    text={errorText} 
                    see={errorView}
                    animate={{ opacity: 1, y:0 }}
                    change={{ opacity: 0, y:'30px' }}
                />
                <AlertSuccess
                    text={successText}
                    see={successView}
                    animate={{ opacity: 1, y:0 }}
                    change={{ opacity: 0, y:'30px' }}
                />
            </>
        )
        
    };
    
};
