import { createRef, useState } from 'react';
import AlertDanger from '../../components/AlertDanger';

export default function Contact(){
    const [dangerAlert, setDangerAlert] = useState(false);
    const [dangerText, setDangerText] = useState('')

    const emailRef = createRef()
    const subjectRef = createRef()
    const contentRef = createRef()

    const sendemail = async () => {
        const email = emailRef.current.value
        const subject = subjectRef.current.value
        const content = contentRef.current.value
        
        if (findDataErrors([email,subject,content])) {
            alertError('Please fill all fields.')
            return;
        }
        
        const response = await (await fetch(`api/sendmail`, {
            method: 'POST',
            body: JSON.stringify({
                EmailBack: email,
                Subject: subject,
                Content: content
            })
        }
        )).json();

        checkresponse(response)
    }

    const findDataErrors = (li) => {
        console.log(li);
        li.forEach(data => {
            if (data === '') {
                console.log(data);
                return true
            }
        });
        return false
    }

    const checkresponse = (response) => {
        if (response.message === 'Email sent') {
            emailRef.current.value = ''
            subjectRef.current.value = ''
            contentRef.current.value = ''
            alert('success', 'Sent!')
            return;
        }
        if (response.message) {
            alertError(response.message)
            return;
        }
        alertError( "I'm sorry, something went wrong. Please wait, then try again. Or, reach out directly via my email.")
    }

    const alertError = (msg) => {
        setDangerText(msg)
        setDangerAlert(true);
        setTimeout(() => { 
            setDangerAlert(false);
        }, 2000);
    }

    return (
        <div className='col-7 mt-3 contact'>
            <form className='d-flex flex-column'>

                <label>Your email address</label>
                <p className="text-muted">
                    This will only be used to respond to your email.
                </p>
                <div className='input-group mb-3'>
                    <input type="email" placeholder="Enter email" className='form-control' ref={emailRef}/>
                </div>

                <label>Subject</label>
                <div className='input-group mb-3'>
                    <input type="text" placeholder="Subject" className='form-control' ref={subjectRef}/>
                </div>
            
                <label>Comments</label>
                <div className='input-group mb-3'>
                    <textarea
                        className='form-control'
                        placeholder="Leave a comment here"
                        style={{ height: '250px' }}
                        ref={contentRef}
                    />
                </div>
            
                <button className="btn btn-primary me-auto" type="submit" onClick={sendemail}>
                    Submit
                </button>
            </form>

            <AlertDanger 
                text={dangerText} 
                see={dangerAlert}
                animate={{ opacity: 1, x: 0 }}
                change={{ opacity: 0, x: -50 }}
            />
        </div>
    );
};