export default function Toast({ toasts, setToasts }){
    if (toasts.length === 0) return

    const remove = (i) => {
        let copy = [...toasts]
        copy.splice(i, 1)
        setToasts(copy)
    }

    return(
        <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: '11'}}>
            {toasts.map((toast, i) => 
                    <div className="mb-1" style={{ display : 'block'}} role="alert" aria-live="assertive" aria-atomic="true" key={i}>
                        <div className="toast-header border border-primary border-bottom-0 border-2">
                            <strong className="me-auto">{toast.title}</strong>
                            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => {remove(i)}}></button>
                        </div>
                        <div className="toast-body border border-primary border-top-0 border-2">
                            {toast.body}
                        </div>
                    </div>
            )}
        </div>
    )
}