import React, { Component, useRef, useState, useEffect } from 'react';
import reactStringReplace from 'react-string-replace';
import setSelection from '../services/setSelection.js';
import '../services/asignPolifill';
import ContentEditable from 'react-contenteditable';

export default function EmailSearch(props) {
  let [ isHint, setIsHint ] = useState(false);
  let emailRef = useRef(null);
  let { email, classFormGroup, emailEdit, emailsArr, enterEmploy, removeEmail, isAlarm } = props;
  let classEmailWrap = 'form-control email-wrap '+ (isHint ? 'focus' : null);

  useEffect(() => {
    window.addEventListener("click", function() {
      setIsHint(false);
    });
  }, []);

  const showHint = (e) => {
    e.stopPropagation();
    setIsHint(true);
  }

  const addEmail = (val) => {
    props.addEmail(val, false);
    setSelection(emailRef.current);
  }

  const handleKeyDown = (e) => {
    if(e.key == 'Enter' || e.key == ' ') {
      props.addEmail(emailRef.current.innerText, true);
      e.preventDefault();
    }
  }

  return (
    <div className = { (email.alarm.length && isAlarm) ? classFormGroup + 'is-invalid' : classFormGroup }>
      <label>Получатели</label>
      <div className = 'email-container' onClick = { showHint }>
        <div className = {classEmailWrap} onClick={ () => emailRef.current.focus() }>
          {
            emailsArr.length
            ? emailsArr.map((el, count) => <div className = 'btn btn-primary' key = { count }>
              { el.name ? el.name : el.email }
              <span className = "email-close" onClick = {() => removeEmail(count)}></span>
            </div>)
            : null
          }

          <ContentEditable innerRef = { emailRef } html = { email.value } disabled = { false } onChange = { emailEdit } tagName = 'div' className = 'email' onKeyDown = { handleKeyDown } />
        </div>
        {
          (enterEmploy.length && isHint)
          ? <div className = 'form-control form-hint-block' >
            {
              enterEmploy.map(el => {
                return (
                  <div className = 'form-hint-group' key = { el.id }>
                    <div className = 'form-hint-department'>{ el.department }</div>
                    {
                      el.item.length
                      ? el.item.map(item => {
                        let rName = reactStringReplace(item.name,
                          email.value,
                          (match, i) => (
                            <mark key = { i }>{ match }</mark>
                          ));
                        let rEmail = reactStringReplace(item.email,
                          email.value,
                          (match, i) => (
                            <mark key = { i }>{ match }</mark>
                          ));
                        return (
                          <div className = 'form-hint-item' key = { item.id } onClick = { ()=> addEmail(item.email) }>
                            <div className = 'form-hint-name'>
                              { rName }
                            </div>
                            <div className = 'form-hint-email'>
                              { rEmail }
                            </div>
                            <div className = 'form-hint-position'>
                              Должность - { item.position }
                            </div>
                          </div>
                        )
                      })
                      : null
                    }
                  </div>
                )
              })
            }
          </div>
          : null
        }
      </div>
      { (email.alarm.length && isAlarm) ? <div className = 'invalid-feedback'>{ email.alarm }</div> : null }
    </div>
  )
}