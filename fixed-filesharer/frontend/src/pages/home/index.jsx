import Jumbatron from './jumbatron';
import Slides from './slides';
import Footer from './footer';
import './../../resources/css/index-styles.css';

export default function Index(){
    return(
        <>
            <Jumbatron/>
            <Slides/>
            <Footer/>
        </>
    );
};