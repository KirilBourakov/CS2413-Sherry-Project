import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import jumbobackground from './../../resources/video/jumbobackground.mp4';

export default function Jumbatron() {
    return(
        <div className="background-jumbo">
            <motion.video autoPlay loop muted initial={{ opacity:0 }}
                whileInView={{ opacity:1  }}
                viewport={{ once: true }}>
                <source src={jumbobackground} type="video/mp4"></source>
            </motion.video>
            <div className='nonvideo'>
                <div className="text-white mb-1">
                    <motion.h1 
                    whileHover={{ color: '#dc3545' }} 
                    transition={{ ease: "easeOut", duration: 1 }} 
                    className="display-1 align-self-center cursor-nochange p-6 m-6"
                    >
                    Sharry: cloud storage and file sharing project
                    </motion.h1>
                </div>
                <Link to={'/storage'}>
                <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button" 
                className="btn btn-primary me-3">To my Storage
                </motion.button>
                </Link>
            </div>
        </div>
    );
};
