import { useState } from "react";
import { motion } from 'framer-motion';
import { MdOutlinePictureAsPdf, MdOutlineImage, MdOutlineInsertDriveFile  } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { images, text, pdf } from "../scripts/fileExtensions"

const variants = {
    HoverFile:{
        scale: 1.02,
        transition: {
            repeat: Infinity,
            repeatType: 'reverse', 
            duration: .3
        }
    }
}


export default function File(props){
    const nav = useNavigate()
    const split = props.filename.split('.')
    const extension = split[split.length-1].toLowerCase()

    const gotofile = () => {
        return nav(`/item/${props.fileid}`, { state: { extension: extension } });
    }

    return(
        <div className='pt-1 ps-1 col-6 col-md-4'>
            <motion.div 
            whileHover={'HoverFile'}
            variants={variants}
            className="border border-dark rounded p-1 d-flex" 
            onClick={gotofile} >
                <div className="align-self-center">
                    {Icon(extension)}
                </div>
                <h4 className="align-self-center ms-auto mb-0">{props.filename}</h4>
            </motion.div>
        </div>
    );
};

function Icon(extension){
    if (images.includes(extension)){
        return <MdOutlineImage size={30}/>
    }
    
    if (text.includes(extension)){
        return <AiOutlineFileText size={30} />
    }

    if (pdf.includes(extension)){
        return <MdOutlinePictureAsPdf size={30}/>
    }

    return <MdOutlineInsertDriveFile size={30}/>
}