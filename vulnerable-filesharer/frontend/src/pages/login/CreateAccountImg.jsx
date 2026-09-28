import { motion } from 'framer-motion';
import IMG from './../../resources/images/password.jpg';


export default function CreateAccountImg(){

    const attribution = () => {
        let url = 'http://www.freepik.com';
        window.open(url, '_blank').focus();
    }

    return(
        <motion.div
        className='imgholder'
        onClick={attribution}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}>
            <img 
                src={IMG} 
                alt='girl typing behind app'
                className='Createaccountimage'
            />
            <small className='imgtext text-muted'>Designed by slidesgo / Freepik</small>
        </motion.div>
    );
};