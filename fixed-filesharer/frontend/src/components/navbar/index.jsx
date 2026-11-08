import UserName from './UserName';
import SearchBar from './search';
import HamburgerMenu from './hamburger';
import { useState, useEffect, useContext } from "react"
import {isLoggedIn} from "../../scripts/authentication.js";


export default function Navbar(){
    const [visible, setVisible] = useState()
    const [hasUser, setHasUser] = useState(false)

    useEffect(()=>{
        async function fetchData(){
            let x = await isLoggedIn()
            setHasUser(x);
        }
        fetchData()
    })

    return(
        <nav className={`navbar navbar-expand-lg navbar-light sticky-top bg-light ${visible ? '' : 'shadow'}`}>
            {hasUser === true ?
                <>
                    <UserName />
                    <div className='ms-auto'>
                        <HamburgerMenu visible={visible} setVisible={setVisible}>
                            <SearchBar/>
                            <a type="button" className="btn btn-primary mx-2" href="/storage">Storage</a>
                            <a type="button" className="btn btn-primary me-2" href="/logout">Logout</a>    
                        </HamburgerMenu>
                    </div>
                </>   
                :
                <>
                    <a className="navbar-brand ms-2" href="/">Sherry</a>
                    <HamburgerMenu visible={visible} setVisible={setVisible}>
                            <SearchBar/>
                            <a className="ms-auto btn btn-primary rounded" href="/login">Login/Sign Up</a>
                    </HamburgerMenu>
                </>
            }
        </nav>  
    );
};
