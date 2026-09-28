import { motion } from 'framer-motion'
import { createRef } from 'react';

const variants = {
    animatesearch:{
        scale: 1.1,
        transition: {
            repeat: Infinity,
            repeatType: 'reverse', 
            duration: .3
        }
    }
};

export default function Search(props){

    const searchRef = createRef()

    const search = () => {
        const userparm = searchRef.current.value.trim();
        if (userparm === ''){
            props.changesearch('|<>|');
        }else{
            props.changesearch(userparm);
        };
    }

    return(
        <form>
            <div className="row">
                <div className="col-3 p-0">
                    <div className="form-group">
                        <input type="text" className="form-control" ref={searchRef} placeholder="Search" onChange={search} />
                    </div>
                </div>
            </div>
        </form>
    );
};