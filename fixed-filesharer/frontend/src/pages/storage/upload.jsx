import { motion } from 'framer-motion'
import { createRef, useContext, useState } from 'react';
import AlertDanger from '../../components/AlertDanger';
import AlertSuccess from '../../components/AlertSuccess';
import { AuthContext } from '../../components/providers/authProvider';

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
    const { authObj, setAuthObj } = useContext(AuthContext)

    const [uploadPrecentage, changeUploadPrecentage] = useState(0);
    const fileRef = createRef();
    const tagRef = createRef();

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

        const formData = new FormData();
        const file = fileRef.current.files[0];
        formData.append('file', file)
        formData.append('filename', file.name)
        formData.append('directory', props.directory)
        formData.append('tags', tagRef.current.value)

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/storage/file', true);
        xhr.setRequestHeader('Authorization', `Token ${authObj.token}`);

        const promise = new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status === 201) {
                    resolve();
                } else {
                    reject('Something went wrong, please try again later');
                }
            };

            xhr.onerror = () => {
                reject('Network error occurred');
            };

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    changeUploadPrecentage(percentComplete)
                }
            };
        });

        xhr.send(formData);

        try {
            await promise
            props.update()
            fileRef.current.value = ''
            tagRef.current.value = ''
        } catch (error) {
            alertError(error);
        }
    }

    const alertError = (text) => {
        setErrorText(text)
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