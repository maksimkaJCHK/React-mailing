import React, { Component } from 'react';
import reactStringReplace from 'react-string-replace';
import setSelection from '../services/setSelection.js';
import '../services/asignPolifill';
import ContentEditable from 'react-contenteditable';

export default class EmailSearch extends Component {
  constructor(props) {
    super(props);
    this.emailRef = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.addEmail = this.addEmail.bind(this);
    this.showHint = this.showHint.bind(this);
    this.state = {
      isHint: false
    }
  }

  componentDidMount() {
    let self = this;
    window.addEventListener("click", function() {
      if(self.state.isHint) {
        self.setState({
          isHint: false
        });
      }
    });
  }

  showHint(e) {
    e.stopPropagation();
    this.setState({
      isHint: true
    });
  }

  addEmail(val) {
    this.props.addEmail(val, false);
    setSelection(this.emailRef.current);
  }

  handleKeyDown(e) {
    if(e.key == 'Enter' || e.key == ' ') {
      this.props.addEmail(this.emailRef.current.innerText, true);
      e.preventDefault();
    }
  }

  render() {
    let { isHint } = this.state;
    let { email, classFormGroup, emailEdit, emailsArr, enterEmploy, removeEmail, isAlarm } = this.props;
    let classEmailWrap = 'form-control email-wrap '+ (isHint ? 'focus' : null);

    return (
      <div className = { (email.alarm.length && isAlarm) ? classFormGroup + 'is-invalid' : classFormGroup }>
        <label>Получатели</label>
        <div className = 'email-container' onClick = { this.showHint }>
          <div className = {classEmailWrap} onClick={ () => this.emailRef.current.focus() }>
            {
              emailsArr.length
              ? emailsArr.map((el, count) => <div className = 'btn btn-primary' key = { count }>
                { el.name ? el.name : el.email }
                <span className = "email-close" onClick = {() => removeEmail(count)}></span>
              </div>)
              : null
            }

            <ContentEditable innerRef = { this.emailRef } html = { email.value } disabled = { false } onChange = { emailEdit }  tagName = 'div' className = 'email' onKeyDown = { this.handleKeyDown } />
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
                            <div className = 'form-hint-item' key = { item.id } onClick = { ()=> this.addEmail(item.email) }>
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
}