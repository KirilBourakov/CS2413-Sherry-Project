import { useContext, useEffect, useRef, useState } from "react"
import { FaPlus, FaMinus } from "react-icons/fa";
import Folder from '../../components/folder'
import File from '../../components/file'
import Toast from "../../components/toast";
import { useLocation } from "react-router-dom";
import { TbFaceIdError } from "react-icons/tb";
import { AuthContext } from "../../components/providers/authProvider";

export default function Search(){
    const { authObj, setAuthObj } = useContext(AuthContext)

    const searchSharedWith = useRef();
    const searchPublic = useRef();
    const searchMine = useRef();
    const location = useLocation();

    const [inputs, setInputs] = useState(1)
    const [search, setSearch] = useState({
        search_criteria: {},
        searchSharedWith: true,
        searchPublic: true,
        searchMine: true
    })
    const [content, setContent] = useState(null)
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        console.log(location)
        if (location.state && location.state.query){
            let copy = {...search}
            copy['search_criteria'][0] = {
                'query': location.state.query,
                'useTags': true,
                'useName': true,
                'useOwner': true,
                'useSharedWith': true,
            }
            setSearch(copy)
            document.getElementById('input1').value = location.state.query

            sendSearch()
        }
    }, [location])

    const createNumberArray = (num) => {
        return Array.from({ length: num }, (_, index) => index + 1);
    }
    const update = () => {
        let copy = {...search}
        copy['searchSharedWith'] = searchSharedWith.current.checked
        copy['searchPublic'] = searchPublic.current.checked 
        copy['searchMine'] = searchMine.current.checked

        setSearch(copy)
    }
    const validQuery = () => {
        const allSearchFalse = search.searchSharedWith === false && search.searchPublic === false && search.searchMine === false
        if (allSearchFalse){
            let copy = [...toasts, {title: 'alert', body: 'You must select content to search through'}]
            setToasts(copy)
            return false
        }
        
        for (const [key, value] of Object.entries(search['search_criteria'])) {
            const hasATrueValue = value['query'] && (value['useTags'] || value['useName'] || value['useOwner'] || value['useSharedWith'])
            if (hasATrueValue){
                return true
            }
        }
        let copy = [...toasts, {title: 'alert', body: 'You must have a search condition that has a selected switch, as well as a query.'}]
        setToasts(copy) 
        return false         
    }

    const sendSearch = async (e) => {
        if (e) e.preventDefault()
        if (!validQuery()){
            return
        }
        
        let response = await fetch('/storage/search', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authObj.token}`,
            },
            method: 'POST',
            body: JSON.stringify(search)
        })
        response = await response.json()

        if (response.directories.length === 0 && response.files.length === 0){
            setContent(undefined)
            return
        }
        setContent(response)
    }

    return(
        <>
            <div className="d-flex flex-column w-screen">
                <h1 className="mx-auto">Search</h1>
                <form className="mx-auto">
                    {createNumberArray(inputs).map(c =>
                        <Input num={c} search={search} updateSearch={setSearch} key={c}/>
                    )}

                    <div className="d-flex align-items-center">
                        <button className="btn btn-primary me-auto" type="submit" onClick={(e) => {sendSearch(e)}}>Search</button>
                        <FaPlus style={{cursor: 'pointer'}} onClick={() => setInputs(inputs+1)}/>
                        <FaMinus style={{cursor: 'pointer'}} onClick={() => setInputs(inputs-1)}/>
                    </div>  

                    <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <input className="form-check-input" type="checkbox" id={`searchMine`} ref={searchMine} onChange={update} defaultChecked />
                        <label className="form-check-label mb-0" htmlFor={`searchMine`} style={{ marginLeft: '5px' }} >Search My Content</label>
                    </div>

                    <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <input className="form-check-input" type="checkbox" id={`searchSharedWith`} ref={searchSharedWith} onChange={update} defaultChecked />
                        <label className="form-check-label mb-0" htmlFor={`searchSharedWith`} style={{ marginLeft: '5px' }} >Search Content Shared With Me</label>
                    </div>

                    <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                        <input className="form-check-input" type="checkbox" id={`searchPublic`} ref={searchPublic} onChange={update} defaultChecked />
                        <label className="form-check-label mb-0" htmlFor={`searchPublic`} style={{ marginLeft: '5px' }} >Search Public Content</label>
                    </div>
                </form>
                {(content !== null && content === undefined) &&
                    <div className="container text-center">
                        <TbFaceIdError size={150}/>
                        <p>No files or directories found</p>
                    </div>
                }
                {(content !== null && content !== undefined) &&
                    <div className="container">
                        <div className='row'>
                            {content.directories &&
                                content.directories.map(d => (
                                    d.show ? (
                                        <Folder key={d.id} name={d.directory_name} path={d.path}/>
                                    ) : null
                                ))
                            }
                        </div>
                        <div className='row'>
                            {content.files &&
                                content.files.map(d => (
                                    d.show ? (
                                        <File key={d.id} filename={d.filename} fileid={d.id} />
                                    ) : null  
                                ))
                            }      
                        </div>     
                    </div>
                }
            </div>
            <Toast toasts={toasts} setToasts={setToasts}/>
        </>
    )
}

function Input({ num, search, updateSearch }){
    const inputRef = useRef();
    const tags = useRef();
    const name = useRef();
    const owner = useRef();
    const sharedWith = useRef();
    
    const update = () => {
        let copy = {...search}
        copy['search_criteria'][num] = {
            'query': inputRef.current.value,
            'useTags': tags.current.checked,
            'useName': name.current.checked,
            'useOwner': owner.current.checked,
            'useSharedWith': sharedWith.current.checked,
        }
        updateSearch(copy)
    }

    return(
        <div className="mb-3">
            <label htmlFor={`input${num}`} className="form-label">Search condition {num}</label>
            <input type="text" className="form-control" id={`input${num}`} aria-describedby="Input For Advanced Search" ref={inputRef} onChange={update}/>
            
            <div className="d-flex align-items-center">

                <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="form-check-input" type="checkbox" id={`searchTags${num}`} ref={tags} onChange={update} defaultChecked />
                    <label className="form-check-label mb-0" htmlFor={`searchTags${num}`} style={{ marginLeft: '5px' }}>Search Tags</label>
                </div>

                <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="form-check-input" type="checkbox" id={`searchName${num}`} ref={name} onChange={update} defaultChecked />
                    <label className="form-check-label mb-0" htmlFor={`searchName${num}`} style={{ marginLeft: '5px' }} >Search Name</label>
                </div>

                <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="form-check-input" type="checkbox" id={`searchOwners${num}`} ref={owner} onChange={update} defaultChecked />
                    <label className="form-check-label mb-0" htmlFor={`searchOwners${num}`} style={{ marginLeft: '5px' }} >Search Owners</label>
                </div>

                <div className="form-check form-switch ms-1" style={{ display: 'flex', alignItems: 'center' }}>
                    <input className="form-check-input" type="checkbox" id={`searchSharedWith${num}`} ref={sharedWith} onChange={update} defaultChecked />
                    <label className="form-check-label mb-0" htmlFor={`searchSharedWith${num}`} style={{ marginLeft: '5px' }} >Search Shared Content</label>
                </div>

            </div>
        </div>
    )
}