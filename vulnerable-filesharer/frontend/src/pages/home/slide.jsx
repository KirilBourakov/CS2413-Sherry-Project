import { motion } from "framer-motion";

export default function Slide(props){
    let img = require(`./../../resources/images/${props.image}.jpg`);
    let html = ''
    if(props.rotation === 1){
        html = (<div className="d-flex my-3">
                <motion.div 
                className="my-auto ms-auto p-4 d-flex flex-column limit"
                initial={{ y:-50, opacity:0 }}
                whileInView={{ y:0, opacity:1  }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                >
                    <h1>{props.title}</h1>
                    <p>{props.content}</p>
                </motion.div>

                <motion.img
                className="me-auto SlideImage"
                initial={{ opacity:0 }}
                whileInView={{ opacity:1  }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.5 }}
                src={img}
                />
        </div>)
    }
    else{
        html = (<div className="d-flex my-3">
            <motion.img
            className="ms-auto SlideImage"
            initial={{ opacity:0 }}
            whileInView={{  opacity:1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1.5 }}
            src={img}
            />

            <motion.div 
            className="my-auto ms-auto p-4 d-flex flex-column limit"
            initial={{ y:-50, opacity:0 }}
            whileInView={{ y:0, opacity:1  }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            >
                <h1>{props.title}</h1>
                <p>{props.content}</p>
            </motion.div>
    </div>)
    }
    return html
};