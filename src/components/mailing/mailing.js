import React, { Component } from 'react';
import LastMailng from '../lastMailing/';
import EmailSearch from '../emailSearch/';
import { Editor } from '@tinymce/tinymce-react';
import superagent from 'superagent';
import './mailing-form.scss';


export default class Mailing  extends Component {
  constructor(props) {
    super(props);

    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.isLoad = this.isLoad.bind(this);
    this.changeInput = this.changeInput.bind(this);
    this.changeTheme = this.changeTheme.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.validation = this.validation.bind(this);
    this.emailValid = this.emailValid.bind(this);
    this.themeValid = this.themeValid.bind(this);
    this.contentValid = this.contentValid.bind(this);
    this.emailEdit = this.emailEdit.bind(this);
    this.addEmail = this.addEmail.bind(this);
    this.removeEmail = this.removeEmail.bind(this);

    this.state = {
      isLoad: true,
      emailsArr: [],
      lastMailing: [],
      isAlarm: false,
      isEmploy: false,
      email: {
        value: '',
        alarm: ''
      },
      theme: {
        value: '',
        alarm: ''
      },
      content: {
        value: '<p>Текст письма</p>',
        alarm: ''
      },
      employ: [],
      enterEmploy: [],
    };
  }

  componentDidUpdate() {
    let { emailsArr, isEmploy, email} = this.state;
    let curEmailValue = email.value;

    if(curEmailValue.length > 2 && !isEmploy) {
      superagent.get('./json/employ.json')
      .send({
        value: curEmailValue
      })
      .set('accept', 'json')
      .end((err, res) => {
        if(err == null) {
          let resp = JSON.parse(res.text);
          let newEnterEmploy = this.getNewEnterEmploy(resp, emailsArr, curEmailValue);
          this.setState({
            employ: [ ...resp ],
            enterEmploy: newEnterEmploy,
            isEmploy: true
          });
        }
      });
    } 

    if(curEmailValue.length < 3 && isEmploy) {
      this.setState({
        employ: [],
        enterEmploy: [],
        isEmploy: false
      });
    }
  }

  changeInput(name, value, alarm) {
    this.setState((state) => {
      return {
        [name]: {
          value,
          alarm
        }
      }
    });
  }

  isEmail(x) {
    let emails = x.match(/(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi);
    return emails;
  }

  // Валидация полей
  themeValid(val) {
    let alarmText = '';
    if(!val.length) {
      alarmText = 'Введите тему сообщения';
    }
    return alarmText;
  }

  contentValid(val) {
    let alarmText = '';
    if(!val.length) {
      alarmText = 'Введите текст сообщения';
    }
    return alarmText;
  }

  emailValid(val) {
    let { emailsArr } = this.state;
    let isEmail = this.isEmail(val);
    let alarmText = '';

    if(isEmail == null && !emailsArr.length) {
      alarmText = 'Заполните поле корректно';
    }
    if(!val.length && !emailsArr.length) {
      alarmText = 'Введите адреса, или адрес для рассылки сообшений';
    }
    return alarmText;
  }

  changeTheme(e) {
    let alarmValid = this.themeValid(e.target.value);
    this.changeInput('theme', e.target.value, alarmValid);
  }

  handleEditorChange(contentVal) {
    let alarmText = this.contentValid(contentVal);
    this.setState((state) => {
      return {
        content: {
          ...state['content'],
          value: contentVal,
          alarm: alarmText
        }
      }
    });
  }

  //Общая валидация
  validation() {
    let { email, theme, content } = this.state;
    let isEmail = this.emailValid(email.value);
    let isTheme = this.themeValid(theme.value);
    let isContent = this.contentValid(content.value);
    let self = this;

    if(!isEmail.length && !isTheme.length && !isContent.length) {
      let message = {
        date: new Date(),
        emails: this.isEmail(email.value)
                ? [ ...this.state.emailsArr, { email: email.value, name: null} ]
                : [ ...this.state.emailsArr ],
        theme: this.state.theme.value,
        content: this.state.content.value
      }

      this.setState(() => {
        return {
          isLoad: true
        }
      });

      superagent.get('./json/answer.json')
      .send({
        ...message
      })
      .set('accept', 'json')
      .end((err, res) => {
        if(err == null) {
          let resp = JSON.parse(res.text);
          self.setState((state) => {
            return {
              ...resp,
              lastMailing: [
                { ...message },
                ...state.lastMailing,
              ]
            }
          });
        }
      });
    } else {
      this.setState({
        ...this.state,
        isAlarm: true,
        email: {
          value: email.value,
          alarm: isEmail
        },
        theme: {
          value: theme.value,
          alarm: isTheme
        },
        content: {
          value: content.value,
          alarm: isContent
        },
      });
    }
  }

  submitForm(e) {
    e.preventDefault();
    this.validation();
  }

  isLoad() {
    this.setState({
      isLoad: false
    });
  }

  getNewEnterEmploy(employ, emailsArr, eText) {
    let newEnterEmploy = [];

    employ.forEach((i) => {
      let inerItems = [];
      let isEmailsArr = [];
      inerItems = i.item.filter(el => {
        isEmailsArr = emailsArr.filter(item => {
         return item.email == el.email;
        });

        return (el.name.toLowerCase().indexOf(eText) != -1 || el.email.toLowerCase().indexOf(eText) != -1) && !isEmailsArr.length;
      });

      if(inerItems.length) {
        newEnterEmploy = [ ...newEnterEmploy, { ...i } ];
        newEnterEmploy[newEnterEmploy.length - 1].item = inerItems;
      }
    });

    return newEnterEmploy;
  }

  addEmail(email, resetText) {
    let { employ, emailsArr, enterEmploy } = this.state;
    let name = null;
    let isEmail = this.isEmail(email);
    let itemInArray = false;
    let newEmploy = [];

    employ.forEach( el => {
      el.item.forEach( item => {
        if(item.email == email) {
          name = item.name;
        }
      });
    });

    emailsArr.forEach( el => {
      if(el.email == email) {
        itemInArray = true;
      }
    });

    enterEmploy.forEach((i) => {
      let inerItems = i.item.filter(el => {
        return el.email != email;
      });

      if(inerItems.length) {
        newEmploy = [ ...newEmploy, { ...i } ];
        newEmploy[newEmploy.length - 1].item = inerItems;
      }
    });

    if(isEmail && !itemInArray) {
      this.setState({
        ...this.state,
        email: resetText ? { ...this.state.email, value: '' } : { ...this.state.email },
        emailsArr: [ ...this.state.emailsArr, { email, name } ],
        enterEmploy: newEmploy
      });
    } else {
      this.setState({
        ...this.state,
        email: { ...this.state.email, value: '' }
      });
    }
  }

  removeEmail(count) {
    let { emailsArr, employ, email } = this.state;
    let newEmailsArr = [];
    let newEnterEmploy = [];
    if(email.value.length > 2) {
      newEmailsArr = [ ...emailsArr.slice(0, count), ...emailsArr.slice(count + 1) ];
      newEnterEmploy = this.getNewEnterEmploy(employ, newEmailsArr, email.value);
    }

    this.setState({
      ...this.state,
      emailsArr: [
        ...emailsArr.slice(0, count),
        ...emailsArr.slice(count + 1),
      ],
      enterEmploy: newEnterEmploy
    });
  }

  emailEdit(e) {
    let eText = e.currentTarget.textContent.toLowerCase();
    let { employ, emailsArr } = this.state;
    let newEnterEmploy = [];
    let isEmail = this.emailValid(eText);

    newEnterEmploy = this.getNewEnterEmploy(employ, emailsArr, eText);
    this.setState({
      email: {
        alarm: isEmail,
        value: eText
      },
      enterEmploy: newEnterEmploy
    });
  }

  render() {
    let { isLoad, emailsArr, email, theme, content, lastMailing, enterEmploy, isAlarm } = this.state;
    let classForm = 'col mailing-form ';
    let classFormGroup = 'form-group ';

    return (
      <div className = 'row'>
        <form className = { isLoad ? classForm + 'loaded' : classForm } onSubmit = { this.submitForm }>
          <EmailSearch email = { email } classFormGroup = { classFormGroup } emailsArr = { emailsArr } enterEmploy  = { enterEmploy } emailEdit = { this.emailEdit } addEmail = { this.addEmail } removeEmail = { this.removeEmail } isAlarm = { isAlarm } />
          <div className = { (theme.alarm.length && isAlarm) ? classFormGroup + 'is-invalid': classFormGroup }>
            <label>Тема письма</label>
            <input type = 'text' className = 'form-control' value = { theme.value } onChange = {this.changeTheme} />
            { (theme.alarm.length && isAlarm) ? <div className = 'invalid-feedback'>{ theme.alarm }</div> : null }
          </div>
          <div className = { (content.alarm.length && isAlarm )? classFormGroup + 'is-invalid mailing-form-editor': classFormGroup + 'mailing-form-editor' }>
            <label>Текст письма</label>
            <Editor
              value = { content.value }
              apiKey = '2wztqnxhks1h0unrdxi43bygwa946one59ikbkp5cem71mu6' 
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                  'code | undo redo | formatselect | image | editimage | media | link | save | bold italic backcolor | table \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help'
              }}
              onEditorChange = { this.handleEditorChange }
              onInit = { this.isLoad }
            />
            { (content.alarm.length && isAlarm) ? <div className = 'invalid-feedback'>{ content.alarm }</div> : null}
          </div>
          <button type = 'submit' className = 'btn btn-primary'>Отправить рассылку</button>
          { isLoad ? <div className = 'mailing-form-preloader'></div> : null }
        </form>
        <LastMailng lastMailing = { lastMailing } />
      </div>
    )
  }
}