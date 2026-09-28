import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LocalSearch({content, setContents}){
    const searchRef = useRef()
    const tagRef = useRef()
    const nameRef = useRef()
    const nav = useNavigate()

    const search = () => {
        const term = searchRef.current.value
        const useTag = tagRef.current.checked
        const useName = nameRef.current.checked

        const noQuery = term.length === 0
        const updatedContent = {
            ...content,
            directories: content.directories.map(directory => {
                const isStr = typeof directory.tags === 'string' || directory.tags instanceof String;
                return {
                    ...directory,
                    show: (useName && directory.directory_name.includes(term)) || (isStr && useTag && directory.tags.includes(term)) || noQuery
                };
            }),
            files: content.files.map(file => {
                const isStr = typeof file.tags === 'string' || file.tags instanceof String;
                return {
                    ...file,
                    show: (useName && file.filename.includes(term)) || (isStr && useTag && file.tags.includes(term)) || noQuery
                };
            })
        };
        setContents(updatedContent);
    }

    const handle = () => {
        nav('/search')
    }

    return(
        <>
            <form>
                <div className="row">
                    <div className="col-3 p-0 me-2 d-flex align-items-center">
                        <input type="text" className="form-control" placeholder="Search" ref={searchRef} onChange={search} />
                    </div>
                    <div className="col-3 p-0 d-flex align-items-center">
                        <div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="useTags" ref={tagRef} onChange={search}/>
                                <label className="form-check-label" htmlFor="useTags">Search Tags</label>
                            </div>
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="useName" ref={nameRef} onChange={search}/>
                                <label className="form-check-label" htmlFor="useName">Search Filename</label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div className="row" style={{marginTop: '-10px'}}>
                <a className="p-0"><small style={{cursor: 'pointer'}} onClick={handle}>Advanced Search</small></a>
            </div>
        </>
    );
}