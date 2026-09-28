import { motion } from 'framer-motion';
import CreateAccount from './CreateAccount';
import CreateAccountImg from './CreateAccountImg';
import './../../resources/css/create-account-styles.css';

export default function Account(){
    return(
        <motion.div 
        initial={{ opacity:0 }}
        whileInView={{ opacity:1  }}
        viewport={{ once: true }}
        className="d-flex m-5 p-5 rounded border border-dark"
        >
            <div className="container">
                <div className="row">
                    <div className="col-7">
                        <CreateAccount/>
                    </div>
                    <div className="col">
                        <CreateAccountImg/>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};