import { createRef, useContext, useState } from 'react';
import AlertDanger from '../../components/AlertDanger';
import { AuthContext } from '../../components/providers/authProvider';

export default function CreateDirectory(props){
    const { authObj, setAuthObj } = useContext(AuthContext)

    const nameRef = createRef();
    const tagRef = createRef();

    const [errorView, setErrorView] = useState(false);
    const [errorText, setErrorText] = useState('')

    const submit = async () => {
        if (nameRef.current.value.includes('/')){
            alertError('Folder name may not include /')
            return
        }
        let response = await fetch(`/storage/directory`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${authObj.token}`,
            },
            method: 'POST',
            body: JSON.stringify({
                'name': '/' + nameRef.current.value,
                'tags': tagRef.current.value,
                'parent': props.directory
            })
        })
        if (response.status !== 201){
            const error = await response.json()
            if (Object.prototype.toString.call(error) === '[object Array]') {
                alertError(error[0])
                return
            } 
            alertError(error.name[0])
            return
        }
        props.update()
        nameRef.current.value = ''
        tagRef.current.value = ''
    }

    const alertError = (text) => {
        setErrorText(text)
        setErrorView(true);
        setTimeout(() => { setErrorView(false); }, 5000);
        return
    } 

    return (
        <div className="position-absolute start-0 top-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={props.show}>
            <div className="text-center bg-primary p-5 pt-3 border border-primary border-5 rounded-3 text-light" onClick={(e) => { e.stopPropagation(); }}>
                <h1>Create Folder</h1>

                <div className="input-group mb-3">
                    <span className="input-group-text">Name</span>
                    <input className='form-control' type="text" size="lg" ref={nameRef} />
                </div>

                <div className="input-group">
                    <span className="input-group-text">Tags</span>
                    <input className='form-control' type="text" size="lg" ref={tagRef} />
                </div>
                <small className="mb-3">seperete tags with a space</small>

                <button 
                    type='button'
                    className='btn btn-primary-dark mx-auto'
                    style={{ width: 'fit-content' }}
                    onClick={(e) => {submit(e)}}
                >
                    Upload
                </button>

                <AlertDanger 
                    text={errorText} 
                    see={errorView}
                    animate={{ opacity: 1, x: 0, hight:"100%" }}
                    change={{ opacity: 0, x: "-100%", hight:'0px'}}
                />
            </div>
        </div>
    )  
}