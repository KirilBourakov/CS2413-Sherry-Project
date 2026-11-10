import { motion } from 'framer-motion'
import {createRef, useContext, useRef, useState} from 'react';
import AlertDanger from '../../components/AlertDanger';
import AlertSuccess from '../../components/AlertSuccess';
import {authedCallback, authedJSONFetch} from "../../scripts/authentication.js";

const variants = {
    HoverSubmitFile:{
        scale: 1.1,
        transition: {
            repeat: Infinity,
            repeatType: 'reverse', 
            duration: .3
        }
    },
    hoverform:{
        scale: 1.02,
        transition: {
            duration: .3
        }
    },
    tapform:{
        scale: .98,
        transition: {
            duration: .3
        }
    }
         
};

export default function Upload(props){
    const [uploadPrecentage, changeUploadPrecentage] = useState(0);
    const fileRef = useRef(null);
    const tagRef = useRef(null);

    // alert error state
    const [errorView, setErrorView] = useState(false);
    const [errorText, setErrorText] = useState('')

    //alert success state
    const [successView, setSuccessView] = useState(false);
    const [successText, setSuccessText] = useState('')

    
    // alert user about upload status
    const alertSuccess = (text) => {
        setSuccessText(text)
        setSuccessView(true);
        setTimeout(() => { setSuccessView(false); }, 5000);
        return
    }

    const uploadFile = async (e) => {
        e.preventDefault()

        // Get upload request
        const file = fileRef.current.files[0];
        const uploadResponse = await authedJSONFetch(`storage/file`, 'POST', { // TODO: no refresh if you wait a long time?
            filename: file.name,
            directory: props.directory,
            tags: tagRef.current.value,
        })
        if (uploadResponse.status !== 201){
            alertError("Something went wrong, please try again later.")
            return
        }
        const uploadToken = (await uploadResponse.json())['key']

        // Send file
        const formData = new FormData();
        formData.append('key', uploadToken)
        formData.append('file', file)
        const sendFile = (token) => new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${import.meta.env.VITE_FILE_URL}/storage/file`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            xhr.onload = () => resolve(xhr.status);
            xhr.onerror = () => reject(new Error('Network error occurred'));
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    changeUploadPrecentage(Math.round((event.loaded / event.total) * 100))
                }
            };

            xhr.send(formData);
        });

        try {
            const status = await authedCallback(sendFile);
            if (status !== 200) {
                throw new Error('Something went wrong, please try again later');
            }

            fileRef.current.value = ''
            tagRef.current.value = ''
            props.update()
        } catch (err) {
            alertError(err.message)
        }
    }

    const alertError = (text) => {
        const message = text instanceof Error ? text.message : String(text);
        setErrorText(message)
        setErrorView(true);
        setTimeout(() => { setErrorView(false); }, 5000);
        return
    } 

    return(
        <div className="position-absolute start-0 top-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={props.show}>
            <div className="text-center bg-primary p-5 pt-3 border border-primary border-5 rounded-3 text-light" onClick={(e) => { e.stopPropagation(); }}>
                    <h1>Upload File</h1>
                    <form className='d-flex flex-column'>

                        <div className="input-group mb-3">
                            <motion.div
                            whileHover={'hoverform'}
                            whileTap={'tapform'}
                            variants={variants}
                            >
                            <input className='form-control' type="file" size="lg" ref={fileRef}/>
                            </motion.div>
                            
                        </div>
                        <div className="input-group">    
                                <span className="input-group-text">Tags</span>
                                <input className='form-control' type="text" size="lg" ref={tagRef} />
                        </div>
                        <small className="mb-3">seperete tags with a space</small>

                        <motion.button 
                            type='button'
                            className='btn btn-primary-dark mx-auto'
                            style={{ width: 'fit-content' }}
                            variants={variants}
                            whileHover='HoverSubmitFile'
                            onClick={(e) => {uploadFile(e)}}
                        >
                        Upload
                        </motion.button>
                        <div className="progress mt-3">
                            <div className="progress-bar bg-primary-dark" role="progressbar" style={{width: `${uploadPrecentage}%`}} aria-valuenow={uploadPrecentage} aria-valuemin="0" aria-valuemax="100">
                                {uploadPrecentage === 0 &&
                                    <>Click submit to start uploading</>
                                }
                                {uploadPrecentage === 100 ?
                                    <>Upload Completed</>
                                :   
                                    <>{uploadPrecentage}%</>
                                } 
                            </div>
                        </div>
                    </form>

                    <AlertDanger 
                        text={errorText} 
                        see={errorView}
                        animate={{ opacity: 1, x: 0, hight:"100%" }}
                        change={{ opacity: 0, x: "-100%", hight:'0px'}}
                    />

                    <AlertSuccess 
                        text={successText} 
                        see={successView}
                        animate={{ opacity: 1, x: 0, hight:"100%" }}
                        change={{ opacity: 0, x: "-100%", hight:'0px'}}
                    />
                </div>
        </div>
    );
};