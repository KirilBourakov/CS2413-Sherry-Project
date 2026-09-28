import { useLocation, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { images, text, pdf } from '../../scripts/fileExtensions'
import { motion } from 'framer-motion';
import { FaRegFileExcel } from "react-icons/fa";
import Description from './description';
import FileNotAccessible from '../../components/fileNotAccessible'
import { AuthContext } from '../../components/providers/authProvider';

export default function Preview(props){
    let location = useLocation();
    const [extension, setExtension] = useState(location.state ? location.state.extension : null)
    const [fileAccessibleCode, setFileAccessibleCode] = useState(200)

    if (fileAccessibleCode !== 200){
        return <FileNotAccessible error={fileAccessibleCode}/>
    }

    // use effect to get file info

    // add support for video, and other file types
    return(
        <motion.div 
        initial={{ opacity:0 }}
        whileInView={{ opacity:1  }}
        viewport={{ once: true }}
        className="container">
            <div className="row">
                <div className="col-12 col-md-8 mt-3 d-flex align-items-center justify-content-center">
                    <FilePreview extension={extension} setFileAccessibleCode={setFileAccessibleCode}/>
                </div>
                <div className="col-12 col-md-4 mt-3">
                    <Description setFileAccessibleCode={setFileAccessibleCode} extensionObj={{extension, setExtension}}/>
                </div>
            </div>
        </motion.div>
    );
}

function FilePreview({extension, setFileAccessibleCode}){
    const { id } = useParams();
    const [fileURL, setFileURL] = useState(null)
    const { authObj, setAuthObj } = useContext(AuthContext)
    // TODO: redo this component in a way where it support different file types and unknown file types.
    useEffect(() => {
        const getFile = async () => {
            let response = await fetch(`/storage/file?file=${id}`, {
                headers: {
                    "Authorization": `Token ${authObj.token}`,
                }
            })
            if (response.status !== 200){
                setFileAccessibleCode(false)
                return
            }
            
            response = await response.blob()
            setFileURL(URL.createObjectURL(response))
        }
        getFile()
    }, [])

    let FileView = null

    if (images.includes(extension)){
        FileView = (
            <div>
                <img 
                    src={fileURL}  
                    style={{
                        width: '75%',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        display: 'block',  
                    }}
                />
            </div>
        )
    }
    if (text.includes(extension) || pdf.includes(extension)){
        FileView = <iframe src={fileURL} className='pdf'> </iframe>
    }

    if (FileView === null){
        return(
            <div className='text-center'>
                <FaRegFileExcel size={150}/>
                <p>This file cannot be displayed.</p>
            </div>
        )
    }
    
    return(
        <div className='text-center' style={{ width: '100%'}}>
            <p><strong>File Preview</strong></p>
            <hr className="mb-1"/>

            {FileView}
        </div>
    )
}