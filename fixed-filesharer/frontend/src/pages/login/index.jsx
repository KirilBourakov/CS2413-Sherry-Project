import './../../resources/css/create-account-styles.css';
import { motion } from 'framer-motion';
import CreateAccountImg from './CreateAccountImg';
import LoginForm from './LoginForm';

export default function Login(){
    return(
        <motion.div 
        initial={{ opacity:0 }}
        whileInView={{ opacity:1  }}
        viewport={{ once: true }}
        className="d-flex m-5 p-5 rounded border border-dark"
        >
            <div className="container">
                <div className="row">
                    <div className="col-md-6 col-xs-12 col-sm-12 my-auto">
                        <LoginForm/>
                    </div>
                    <div className="col col-md-1 col-sm-1 colsmall">
                        <CreateAccountImg/>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};