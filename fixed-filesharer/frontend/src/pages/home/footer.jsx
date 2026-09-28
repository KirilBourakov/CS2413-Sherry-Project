import { motion } from 'framer-motion';
import Contact from './contact';
import paragraphs from './../../resources/data/aboutContent.json'

export default function Footer(){
    let parid = 0
    return(
        <motion.footer
        className="bg-dark text-white"
        initial={{ y:-50, opacity:0 }}
        whileInView={{ y:0, opacity:1  }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        >
            <div className="container">
                <div className="row">
                    <div className='col'>
                        <h1 className="display-6 my-2">About Sharry</h1>
                        {paragraphs.map((paragraph) => {
                            parid++
                            return <p key={parid}>{paragraph.content}</p>
                        })}
                    </div>
                    <Contact/>
                </div>
            </div>
        </motion.footer>
    );
};