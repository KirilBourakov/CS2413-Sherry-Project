import { motion } from "framer-motion";
import { useParams } from 'react-router-dom'; 
import { useState, useEffect, useContext } from "react";
import Content from './contents';
import Upload from './upload';
import LocalSearch from './localSearch'
import New from './new'
import CreateDirectory from "./createDirectory";
import { useLocation } from 'react-router-dom';
import {authedJSONFetch, checkLoginAndRedirect} from "../../scripts/authentication";
import { useNavigate } from "react-router-dom";

export default function Main(){
    const nav = useNavigate()
    const location = useLocation();

    const [showUpload, changeShowUpload] = useState(false)
    const [showNewDirectory, changeShowNewDirectory] = useState(false)
    const [contents, setContents] = useState({});
   

    let path = useParams()['*']
    if (path === undefined){
        path = '/'
    } else {
        path = '/' + path
        if (path.slice(-1) === '/') path = path.slice(0,-1)
    }

    useEffect(() => {
        checkLoginAndRedirect(nav)
        fetchContents();
    }, [location]);

    const fetchContents = async () => {
        let response = await authedJSONFetch(`storage/directory?path=${path}`,'GET')
        response = await response.json()
        setContents(response)
    };

    const updateView = () => {
        fetchContents()
        return
    }

    const uploadPopup = () => {
        if (showNewDirectory) changeShowNewDirectory(false)
        changeShowUpload(!showUpload)
        
    }
    const directoryPopup = () => {
        if (showUpload) changeShowUpload(false)
        changeShowNewDirectory(!showNewDirectory) 
    }

    return(
        <>
            <motion.div
            initial={{ opacity:0 }}
            whileInView={{ opacity:1  }}
            viewport={{ once: true }}>
                <div>
                    <div className="container">
                        <div className="row mt-3">
                            <LocalSearch content={contents} setContents={setContents}/>
                        </div>
                        <div className="row mt-3">
                            <Content content={contents}/>
                        </div>
                    </div>
                    {showUpload &&
                        <Upload update={updateView} directory={path} show={uploadPopup}/>
                    }
                    {showNewDirectory &&
                        <CreateDirectory update={updateView} directory={path} show={directoryPopup}/>
                    }
                </div>
            </motion.div>
            <New uploadPopup={uploadPopup} directoryPopup={directoryPopup}/>
        </>
    );
};

