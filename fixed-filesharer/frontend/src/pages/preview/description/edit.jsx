import { motion } from "framer-motion"
import EditVisibility from "./editVisibility"
import { createRef, useContext } from "react"
import { useNavigate } from "react-router-dom";
import {authedJSONFetch} from "../../../scripts/authentication.js";

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

const tagsRef = createRef()
export default function Edit({ isPublic, shared_with, tags, id, update }){
    const nav = useNavigate()
    const updateTags = async () => {
        const response = await authedJSONFetch(`storage/fileInfo/${id}`, 'PATCH', {
            tags: tagsRef.current.value
        })
        if (response.status === 200){
            update()
        }
        console.log(response.status)
        return
    }
    const deleteFile = async () => {
        const response = await authedJSONFetch(`storage/file?file=${id}`, 'DELETE')
        if (response.status === 200){
            nav('/storage')
        }
    }

    return(
        <div className='d-flex flex-column'>
            <hr className='description'/>
            
            <strong className='me-1 align-self-center'>Edit Tags</strong>
            <div className='d-flex align-items-center mt-3'>
                <div className="input-group">
                    <input type="text" ref={tagsRef} defaultValue={tags} className="form-control rounded" placeholder="Add Tags" aria-label="AddTags" />
                    <motion.button
                    onClick={updateTags}
                    whileHover={'HoverButton'}
                    variants={variants} 
                    className="btn btn-primary ms-2 rounded">
                        Edit
                    </motion.button>
                </div>
            </div>
            <small className="form-text text-muted">Remember to use spaces between your tags</small>
            
            <hr className='description'/>
            
            <strong className='me-1 align-self-center'>Edit Users</strong>
            <EditVisibility isPublic={isPublic} shared={shared_with} update={update}/>
            
            <hr className='description'/>

            <strong className='me-1 align-self-center'>DANGER!</strong>
            <motion.button 
                onClick={deleteFile}
                whileHover={'HoverButton'}
                variants={variants} 
                className="btn btn-danger ms-2 mb-1">
                    <strong>Delete file</strong>
            </motion.button>
        </div>
    )
}