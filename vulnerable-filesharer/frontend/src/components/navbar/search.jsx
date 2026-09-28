import { useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function SearchBar(){
    const searchRef = useRef()
    const nav = useNavigate()

    const search = (e) => {
        e.preventDefault()
        nav("/search", { state: { query: searchRef.current.value } });
    }

    return(
        <form className="form-inline my-2 my-lg-0 d-flex" onSubmit={(e) => {search(e)}}>
            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" ref={searchRef}/>
            <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">Search</button>
        </form>
    )
}